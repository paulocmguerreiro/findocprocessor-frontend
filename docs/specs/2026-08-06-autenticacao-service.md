# Spec: AutenticacaoService — login/logout via SessaoAtivaStore

**Issue:** #12
**Brief:** docs/briefs/2026-08-06-autenticacao-service.md
**Data:** 2026-08-06

## Requisitos funcionais

- **RF-01:** `AutenticacaoService` em `src/app/core/services/autenticacao.service.ts`, decorado com `@Injectable()`
  **sem** `providedIn: 'root'`. Dependências por `inject()`: `HttpClient`, `API_URL`, `SessaoAtivaStore`.
  Sem estado próprio — nenhum campo de instância além das dependências injetadas.
- **RF-02:** `efetuarAutenticacao(credenciais)` emite `POST {API_URL}/auth/login` com body JSON `{ email, password }`.
  O tipo do parâmetro deriva do contrato
  (`paths['/auth/login']['post']['requestBody']['content']['application/json']`), importado do
  ficheiro-índice `src/app/contrato`. Nenhuma interface escrita à mão para a forma do body.
  O alias local `CredenciaisAutenticacao` é deliberadamente a única referência a essa expressão: quando
  o backend nomear o schema de pedido em `components.schemas` (ver `WRN-003`), a migração é substituir
  uma linha por um import, sem tocar no serviço nem nos testes.
- **RF-03:** Em 200, `efetuarAutenticacao()` lê `Token['data']['token']`. Se for uma `string` **não vazia**, chama
  `sessaoAtivaStore.registarSessao(token)` e emite a resposta ao chamador.
- **RF-04:** Em 200 com token **ausente ou vazio** (`undefined`, `data` ausente, ou `''`), `efetuarAutenticacao()`
  chama `sessaoAtivaStore.encerrarSessao()` e emite um erro ao chamador — a resposta não é tratada
  como sucesso. A string vazia cai neste ramo por decisão explícita: `04-core/sessao-ativa.md` regista
  que o store **não rejeita** `''` e delega esse juízo a quem chama — e quem chama é este serviço.
- **RF-05:** Em **qualquer** erro HTTP de login, `efetuarAutenticacao()` chama `sessaoAtivaStore.encerrarSessao()` e
  repropaga o erro original ao chamador, sem o transformar nem o inspecionar. O ramo é único e não
  distingue códigos: 422 `ErrorValidacao`, 429 do `throttle:login` (comportamento real do backend que
  **não** está no `openapi.yaml`), 5xx, e falha de rede/timeout (`HttpErrorResponse` com `status: 0`).
  Em particular, o serviço não lê `error.detail` — num 5xx o Laravel devolve HTML e `error` vem
  `string`, não o envelope `ApiError`.
- **RF-06:** `terminarSessao()` emite `POST {API_URL}/auth/logout` sem body. O header `Authorization` **não**
  é composto pelo serviço — é o `bearerTokenInterceptor` que o anexa a partir do store.
- **RF-07:** Em 204, `terminarSessao()` chama `sessaoAtivaStore.encerrarSessao()` e completa.
- **RF-08:** Em **qualquer** erro HTTP de logout (401 `ErrorNaoAutenticado`, 5xx, falha de rede ou
  timeout), `terminarSessao()` chama `sessaoAtivaStore.encerrarSessao()` na mesma e repropaga o erro original.
  Ramo único, pelas mesmas razões da RF-05.
- **RF-09:** `API_URL` (`InjectionToken<string>`) criado em `src/app/core/api-url.token.ts` com
  `providedIn: 'root'` e `factory: () => environment.apiUrl`, conforme `04-core/tokens.md`.
- **RF-10:** `src/environments/environment.ts` (dev) exporta `environment` com `apiUrl` a apontar para
  o host de Valet do backend, **incluindo o prefixo `/api`**.
- **RF-11:** `src/environments/environment.production.ts` exporta a mesma forma com `apiUrl` relativo
  à própria origem (sem host), e o `angular.json` substitui um pelo outro via `fileReplacements` na
  configuração `production` do target `build`.
- **RF-12:** `angular.json`, target `test`: `coverageInclude` passa a incluir
  `src/app/core/services/**/*.ts`.
- **RF-13:** Os efeitos sobre o `SessaoAtivaStore` vivem **dentro** do stream devolvido, no caminho de
  sucesso e no de erro (`tap`/`catchError` ou equivalente) — nunca em `finalize`. Consequência exigida:
  se o chamador se desinscrever antes de a resposta chegar (componente destruído, navegação a meio do
  pedido), nem `registarSessao` nem `encerrarSessao` são chamados.

## Requisitos não funcionais

- **RNF-01:** TypeScript strict, sem `any`. O desembrulhar de `string | undefined` faz-se por guarda
  explícita, não por asserção de tipo (`as string`) nem `!`.
- **RNF-02:** Nenhum `console.log`/`console.error` com `email`, `password` ou token — nem no serviço
  nem nos testes (RGPD/NIS2).
- **RNF-03:** O token não toca em `localStorage`, `sessionStorage`, cookies ou `TransferState`. A
  custódia é exclusivamente do `SessaoAtivaStore`, em memória.
- **RNF-04:** `ng lint` continua verde **sem** acrescentar exceções a `eslint.config.js` — prova de
  que o serviço não lê `tokenParaAutorizacao`.
- **RNF-05:** Gate completo a verde: `ng lint` + `ng build --configuration=production` +
  `ng test --coverage --watch=false`, com o limiar de 95% já a medir o ficheiro novo.

## Contratos de API

| Método | Path | Request | Response |
| ------ | ---- | ------- | -------- |
| POST | `/auth/login` | `application/json` — `{ email: string; password: string }` | 200 `Token` (`{ data?: { token?: string } }`) · 422 `ErrorValidacao` |
| POST | `/auth/logout` | sem body | 204 sem content · 401 `ErrorNaoAutenticado` |

Ambas as rotas **já existem** em `src/app/contrato/api.generated.ts` — nenhum delta de contrato,
nenhuma dependência backend-first. Os tipos (`Token`, `ErrorValidacao`, `ErrorNaoAutenticado`, `paths`)
importam-se do ficheiro-índice `src/app/contrato`, nunca de `api.generated.ts`.

Prefixo `/api` confirmado em `routes/api.php` do backend (`Route::post('auth/login', ...)`) — faz
parte da base URL, não dos paths compostos pelo serviço.

## Modelo de dados

Nenhum model novo. A forma do `environment`:

| Campo | Tipo | Obrigatório | Notas |
| ----- | ---- | ----------- | ----- |
| `apiUrl` | `string` | sim | Base da API, com prefixo `/api`. Dev: `http://findocprocessor-backend-laravel.test/api`. Produção: `/api` (mesma origem) |

## Regras de negócio

- **RN-01:** Sessão registada **se e só se** o backend devolveu um token utilizável. Qualquer outro
  desfecho de `efetuarAutenticacao()` — erro HTTP ou 200 sem token — deixa a aplicação sem sessão.
- **RN-02:** Uma tentativa de login falhada encerra também a sessão anterior, se existia. É intencional
  (CA-04): mais vale perder uma sessão válida do que manter estado que já não corresponde ao que o
  backend sabe.
- **RN-03:** O encerramento local do logout não depende da confirmação do backend. Se o token já era
  inválido no servidor, o pior cenário é encerrar uma sessão que já não existia.
- **RN-04:** O encerramento de sessão do `terminarSessao()` ocorre sempre no **resultado** do pedido (sucesso
  ou erro), nunca antes de este ser emitido — caso contrário o pedido sairia sem `Authorization`,
  porque o interceptor lê o store no momento da emissão.
- **RN-05:** O `AutenticacaoService` é a **única** fronteira que desembrulha `Token['data']['token']`
  (`04-core/sessao-ativa.md`). O store continua a receber sempre uma `string` já resolvida — e **não
  vazia**: rejeitar `''` é responsabilidade de quem chama, por decisão registada no store.
- **RN-06:** Um pedido cancelado não é um desfecho: se o chamador desistir antes da resposta, o estado
  de sessão fica exatamente como estava. Não há "meio termo" — só resposta ou erro alteram o store.
- **RN-07:** O serviço não interpreta o corpo do erro. O envelope `ApiError` é para a UI e para o
  futuro `errorInterceptor`; aqui o erro atravessa intacto, porque nem todo o erro traz envelope
  (5xx com HTML, `status: 0` sem corpo, 429 fora do contrato).

## Dependências

- Issues bloqueantes: **nenhuma**. #5 (`SessaoAtivaStore`) e #10 (`bearerTokenInterceptor`) já fechadas.

## Questões resolvidas

| Questão (do Brief) | Decisão |
| ------------------ | ------- |
| Que `apiUrl` fica em `environment.ts`? | Host de Valet: `http://findocprocessor-backend-laravel.test/api` — o mesmo host que `npm run sync:contract` já usa |
| `environment.production.ts` + `fileReplacements` entram nesta issue? | **Sim** — âmbito alargado por decisão no Checkpoint A. Produção serve da mesma origem, logo `apiUrl: '/api'` (relativo, sem host). O `/api` mantém-se porque é o prefixo real das rotas do backend, não uma escolha de ambiente |
| O que faz `efetuarAutenticacao()` perante um 200 sem `data.token`? | Trata como falha: `encerrarSessao()` + erro propagado ao chamador. Uma sessão válida implica token devolvido; sem token, um pedido subsequente seria barrado pelo Sanctum de qualquer forma — melhor falhar aqui, de forma visível, do que ficar num estado "autenticado" inútil |
| Que forma tem a API pública de `efetuarAutenticacao()`/`terminarSessao()`? | `Observable` devolvido ao chamador (default do projeto: `HttpClient` para leituras e mutações), com os efeitos de sessão dentro do stream. Subscrição e tratamento de erro de UI ficam para o futuro componente de login |
| Alargar `coverageInclude`? | **Sim** — `src/app/core/services/**/*.ts` entra no âmbito de cobertura nesta issue |
| Que edge cases reais cobrir a este nível? _(levantada no Checkpoint B)_ | Os que uma implementação plausível erraria em silêncio e que o mock consegue provar: token vazio (CA-15), cancelamento a meio (CA-16), rede/timeout e 429 fora do contrato (CA-17), 5xx com corpo HTML (CA-18). **Fora deste nível** — valor do `apiUrl`, CORS, Sanctum real, SSE, `fileReplacements` — registado em `WRN-002` para uma camada e2e em issue própria. Testar "URL incorreto" aqui é teatro: o `expectOne()` prova a *composição* do URL, nunca o valor do `apiUrl` |

## Critérios de aceitação

> Herdados da issue — nunca remover ou reformular os CAs originais sem justificação.
>
> **Desvio registado (2026-08-06, Checkpoint B):** os CAs da issue nomeiam `LoginService`,
> `src/app/core/services/login.service.ts`, `login()` e `logout()`. Por decisão do utilizador, os
> símbolos passam a Português — `AutenticacaoService`, `src/app/core/services/autenticacao.service.ts`,
> `efetuarAutenticacao()`, `terminarSessao()` — por consistência com o `SessaoAtivaStore`
> (`registarSessao`/`encerrarSessao`/`estaAutenticado`) e com `02-shared/convencoes-nomenclatura.md`
> ("símbolos de domínio em PT"). **Os paths do contrato não mudam** (`/auth/login`, `/auth/logout`):
> pertencem ao backend. O texto abaixo é o dos CAs originais com os nomes substituídos — nenhum
> critério foi removido, adicionado ou enfraquecido. A issue #12 no GitHub continua a dizer
> `LoginService`; sincronizar o corpo da issue é ação à parte.

- [ ] CA-01: `AutenticacaoService` (`src/app/core/services/autenticacao.service.ts`) usa `@Injectable()` **sem**
      `providedIn: 'root'` — é stateless e fornecido via `providers` dos componentes/rotas que o usam,
      não como singleton global. `inject(HttpClient)`, `inject(API_URL)`. _(issue)_
- [ ] CA-02: `efetuarAutenticacao(credenciais)` faz `POST /auth/login` com body `{ email, password }`, com o tipo do
      body extraído do contrato — sem duplicar a forma à mão. _(issue)_
- [ ] CA-03: Em 200, desembrulha `Token['data']['token']`, confirma que existe e chama
      `registarSessao(token)`. Só o `AutenticacaoService` faz este desembrulhar. _(issue)_
- [ ] CA-04: Em erro de login (422 ou falha de rede), chama `encerrarSessao()` antes de repropagar o
      erro. _(issue)_
- [ ] CA-05: `terminarSessao()` faz `POST /auth/logout`; em 204 chama `encerrarSessao()`. _(issue)_
- [ ] CA-06: Em erro de logout (401 ou falha de rede), chama `encerrarSessao()` na mesma. _(issue)_
- [ ] CA-07: `AutenticacaoService` nunca lê `tokenParaAutorizacao` — `ng lint` passa sem nova exceção em
      `eslint.config.js`. _(issue)_
- [ ] CA-08: `API_URL` (`InjectionToken<string>`) e `src/environments/environment.ts` criados. _(issue)_
- [ ] CA-09: Testes (Vitest + `HttpTestingController`) para os 4 cenários — login sucesso, login erro,
      logout sucesso, logout erro — com `SessaoAtivaStore` mockado. _(issue)_
- [ ] CA-10: `src/environments/environment.production.ts` criado **e** ligado por `fileReplacements`
      na configuração `production` do target `build` do `angular.json` — o bundle de produção não pode
      levar a `apiUrl` de dev. _(spec)_
- [ ] CA-11: `coverageInclude` do target `test` inclui `src/app/core/services/**/*.ts`; o relatório de
      `ng test --coverage --watch=false` mostra `autenticacao.service.ts` e o limiar de 95% mantém-se. _(spec)_
- [ ] CA-12: Teste que fixa o 200 sem `data.token`: `encerrarSessao()` chamado, `registarSessao` **não**
      chamado, erro entregue ao chamador. _(spec)_
- [ ] CA-13: Teste que fixa a ordem no `terminarSessao()`: o pedido é emitido (e a asserção de `expectOne`
      passa) **antes** de `encerrarSessao()` ser chamado — o encerramento acontece no resultado, nunca
      antes da emissão. _(spec)_
- [ ] CA-14: Teste que fixa a RN-02: com sessão já registada, um login falhado deixa o store encerrado
      (`encerrarSessao()` chamado), não a sessão anterior intacta. _(spec)_
- [ ] CA-15: Teste que fixa o token **vazio**: 200 com `data.token === ''` segue o mesmo ramo do token
      ausente — `encerrarSessao()` chamado, `registarSessao` **não** chamado, erro ao chamador. Sem
      este ramo, `estaAutenticado()` ficaria `true` com credencial inútil, porque o store aceita `''`
      de propósito. _(spec)_
- [ ] CA-16: Teste que fixa a RN-06/RF-13 — cancelamento a meio: desinscrever de `efetuarAutenticacao()` antes de
      `flush()` não chama `registarSessao` **nem** `encerrarSessao`. É o único teste que distingue
      `tap` de `finalize`; sem ele, trocar um pelo outro passa despercebido. _(spec)_
- [ ] CA-17: Testes do ramo de erro não previsto no contrato, em `efetuarAutenticacao()` e em `terminarSessao()`: falha de
      rede/timeout (`HttpErrorResponse` com `status: 0`) e 429 do `throttle:login` — ambos chamam
      `encerrarSessao()` e repropagam, tal como o 422/401. Um teste por ramo, não um por código de
      status. _(spec)_
- [ ] CA-18: Teste que fixa a RN-07: um 5xx com corpo **não-JSON** (HTML da página de erro do Laravel)
      não parte o serviço — nenhuma leitura de `error.detail`, `encerrarSessao()` chamado e o erro
      original entregue intacto ao chamador. _(spec)_

## SYSTEM_SPEC a atualizar

> Fase 3a (`/documenta-implementacao`) — nunca na Fase 2.

- `docs/system_spec/04-core/services.md` — deixa de dizer "nenhum service implementado"; documenta o
  `AutenticacaoService` e o desvio consciente ao padrão-tipo (`@Injectable()` não-root vs `@Service()`/root).
- `docs/system_spec/04-core/tokens.md` — `API_URL` passa de "pendente" a implementado, com o caminho
  do ficheiro.
- `docs/system_spec/06-config.md` — `environment.ts` e `environment.production.ts` passam a existir;
  `fileReplacements` na configuração `production`; `coverageInclude` alargado.
- `docs/system_spec/04-core/sessao-ativa.md` — "Fora de âmbito" perde a referência ao serviço de
  autenticação; a secção "Fronteira — quem desembrulha o token" ganha o nome concreto do serviço.
- `docs/system_spec/07-testing.md` — nota sobre o âmbito de cobertura ter passado a incluir
  `core/services/**`.

Nenhum ficheiro novo em `docs/system_spec/` → `00-index.md` não precisa de linha nova.

## Verificação RGPD/NIS2

- **Dados pessoais:** sim — `email` e `password` no body do login, só em trânsito. Nunca persistidos,
  nunca logados (RNF-02). O token de resposta vive apenas em memória no `SessaoAtivaStore` (RNF-03).
- **Superfície de ataque:** alterada — primeiro serviço do frontend que emite e revoga credenciais
  Bearer. Mitigações: token nunca sai da memória; nenhum desfecho de `efetuarAutenticacao()` deixa sessão parcial
  (RN-01); logout encerra localmente mesmo sem confirmação do backend (RN-03); a barreira ESLint de
  leitura do token mantém-se sem novas exceções (RNF-04). A `apiUrl` relativa em produção elimina a
  hipótese de o bundle de produção falar com o host de desenvolvimento.
