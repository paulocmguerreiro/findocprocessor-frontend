# Brief: SessaoAtivaStore — estado de sessão ativa (token, estaAutenticado)

**Issue:** #5
**Data:** 2026-08-05
**Branch:** feat/sessao-ativa-store

## Contexto

A aplicação não tem hoje nenhuma entidade que represente "há alguém autenticado": nada em
`src/app/state/`, nenhum service em `core/services/`, nem interceptors, nem rotas.
Esta issue cria a primeira peça de estado partilhado do projeto e, com ela, o primeiro precedente
concreto do padrão de signal store — até agora só documentado em `02-shared/padroes-signals.md` como
template.

O store é o ponto de aterragem do fluxo de autenticação que vem a seguir: um **futuro serviço de
autenticação** faz `POST /auth/login`, desembrulha o token da resposta e regista-o aqui; um **futuro
interceptor de autenticação** lê o token para o header `Authorization`; e um **futuro serviço de
perfil/permissões** consumirá `GET /auth/me` para trazer os dados do utilizador e os respetivos roles —
esse endpoint ainda não existe no contrato. Os nomes destes serviços não estão fixados (o serviço de
permissões é candidato natural a ficar com o `/auth/me`, pelo que o nome pode ainda mudar); nenhum
deles é criado nesta issue.

A sessão inicia-se **exclusivamente com o token**: é a única coisa que `POST /auth/login` devolve
(`api.generated.ts:7-56`). Tudo o resto — identificação do utilizador e permissões — chega mais tarde,
por `GET /auth/me`, em issue futura.

**Este store não representa o modelo `Utilizador`.** Quando os dados do `/auth/me` existirem, o store
guardará apenas a **informação parcial** de que a app precisa, exposta diretamente por signals e por
métodos de validação de permissões — nunca o recurso do contrato inteiro nem um espelho dele.

### Decisões fechadas no planeamento

As três invariantes que a issue deixou explicitamente para `/planeia-issue`, mais as que surgiram ao
confrontar o enunciado com o contrato e com as convenções do projeto:

| Tema                    | Decisão                                                 | Fundamento                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Decorador               | **`@Service()`** sem `providedIn` (implícito)           | `get_best_practices` (v22): _"Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services"_. `Service` confirmado em `@angular/core` 22.0.8 (`ServiceDecorator`, `types/core.d.ts:1268`); a documentação oficial de signals em services já usa `import {Service, signal, computed}`. Aplicação do critério geral fixado abaixo: `SessaoAtivaStore` é root |
| Nomenclatura            | `SessaoAtivaStore` em `state/`                          | Nome/intenção de domínio em PT (`SessaoAtiva`); `Store` é vocabulário técnico de design pattern e mantém-se em EN, como `Service`/`Component`                                                                                                                                                                                                                                                                                  |
| Nome do derivado        | **`estaAutenticado`** (não `autenticado`)               | O verbo declara a intenção do `computed()` e torna aferível o valor devolvido — lê-se como a pergunta booleana que responde. Segue NOME+Intenção de `02-shared/convencoes-nomenclatura.md`, na linha do exemplo `estaACarregar`. O CA-02 escreve `autenticado`; o critério de nomenclatura do projeto prevalece e a issue acompanha                                                                                            |
| Local no system_spec    | `docs/system_spec/04-core/sessao-ativa.md`              | Confirma a proposta da issue: `04-core/sse.md` já documenta um store de `state/` a partir de `04-core/`. Não se cria secção `08-state/` — não se antecipa estrutura para stores nestas condições, que não se esperam frequentes                                                                                                                                                                                                |
| Predicado do derivado   | Autenticado **a partir do momento em que existe token** | Presença de token, sem validação de forma nem de expiração — validar o token é do backend                                                                                                                                                                                                                                                                                                                                      |
| Assinatura              | `registarSessao(token: string): void`                   | Tipo primitivo; nada a compor a partir do contrato, logo `models/` não é tocada (a issue admitia-o como possibilidade)                                                                                                                                                                                                                                                                                                         |
| Exposição do token      | **Signal `readonly`** (CA-02) **+ regra ESLint** que impede o acesso no resto da aplicação | Cumpre a letra do CA-02 e a leitura pública do template de `padroes-signals.md`. Como o Angular não tem visibilidade por consumidor em runtime (R3), a restrição é obtida em *lint*: só `core/interceptors/**` pode ler o token; em qualquer outro sítio, `ng lint` falha. Não é barreira de execução — torna a leitura indevida um ato deliberado que rebenta o gate de CI em vez de passar despercebido |
| Nome do signal do token | **`tokenParaAutorizacao`**, com **comentário no código** a declarar o nome como não-renomeável e porquê | O nome é o que a regra ESLint usa como âncora (`MemberExpression[property.name="tokenParaAutorizacao"]`), o único seletor sintático sem falsos positivos: não colide com o desembrulhar de `Token['data']['token']` no futuro serviço de autenticação (R1) nem depende do nome com que o store é injetado. Sendo o nome carga estrutural da regra, renomeá-lo desliga a proteção **em silêncio** — o comentário existe para que isso não aconteça por distração. O nome declara também a intenção do valor, como `estaAutenticado` |
| Critério do decorador   | **`@Service()` quando é root; `@Injectable()` quando não é** | Regra geral do projeto, aplicável a todos os singletons e não só a este store. `SessaoAtivaStore` é root, logo `@Service()`. Passa a ser critério documentado em `02-shared/padroes-signals.md` — deixa de ser exceção pontual |

> Nota factual sobre o critério do decorador: `@Service()` também aceita
> `@Service({ autoProvided: false })` para casos não-root (`ServiceDecorator`, `types/core.d.ts:1282`).
> O critério do projeto opta por `@Injectable()` nesse cenário — fica registado que a alternativa
> existe, caso se queira reavaliar mais tarde.

## O que muda

**Camada `state/`** — novo ficheiro `src/app/state/sessao-ativa.store.ts`:

- Singleton `@Service()` com um único signal privado de estado, `_token` (CA-01).
- Leitura pública `readonly` do token em `tokenParaAutorizacao` — com comentário adjacente a declarar
  que o nome não pode ser alterado, por ser a âncora da regra ESLint — e `estaAutenticado` como
  `computed()` derivado da presença de token, sem signal duplicado (CA-02).
- `registarSessao(token: string): void` (CA-03) e `encerrarSessao(): void` (CA-04).
- Zero HTTP (CA-06), zero `localStorage`/`sessionStorage`, zero dependências injetadas.

**Qualidade** — nova regra `no-restricted-syntax` em `eslint.config.js`, ancorada em
`tokenParaAutorizacao`, mais um bloco `files: ['src/app/core/interceptors/**']` que a desativa aí.
Passa a fazer parte do gate `ng lint`, que já corre em CI. Sendo `core/interceptors/` hoje uma pasta
só com `.gitkeep`, a regra fica a proteger uma exceção ainda por povoar — é intencional: entra em
vigor antes de haver código que a possa violar.

**Padrão partilhado** — `02-shared/padroes-signals.md` passa a registar o critério do decorador
(`@Service()` se root, `@Injectable()` caso contrário), que deixou de ser decisão isolada deste store,
e o estado privado passa a usar campo privado nativo do JavaScript (`#token`) em vez do prefixo
underscore: sendo privado, que o seja também em runtime e não só para o TypeScript. A issue já previa
este ficheiro como "se o padrão precisar de nota". `02-shared/contratos-por-camada.md` acompanha o
critério do decorador, para não ficar a dizer `providedIn: 'root'`.

**Testes** — `src/app/state/sessao-ativa.store.spec.ts` (Vitest, ao lado do código): estado inicial sem
sessão, `registarSessao`, `encerrarSessao`, `estaAutenticado` nos dois estados (CA-05), e **persistência do
estado entre leituras** — que o valor registado se mantém em leituras sucessivas e que o `computed()`
reage à mutação; ou seja, que signals e métodos estão operacionais e não apenas presentes.

**Documentação** — `docs/system_spec/04-core/sessao-ativa.md` (novo) + a respetiva linha na tabela
`Core` de `00-index.md`.

## O que NÃO muda

- **Nada de HTTP** — o store não conhece `HttpClient`. Quem chama `/auth/login` é o futuro serviço de
  autenticação, que não é criado aqui.
- **Identificação do utilizador e roles** — fora de âmbito; dependem de `GET /auth/me`, que não existe
  no contrato.
- **Serviço de autenticação, serviço de perfil/permissões, interceptor de autenticação** — nenhum é
  criado nesta issue.
- **`src/app/contrato/`** — não se toca (é 100% gerado) e não se pede nada de novo ao backend nesta
  issue: a assinatura do store é `string`, não depende de nenhum schema.
- **`src/app/models/`** — continua vazia; com uma assinatura de `string` não há view-model a compor.
- **A estrutura do template de `02-shared/padroes-signals.md`** — o padrão em si não é reescrito; muda
  o decorador, o prefixo do estado privado e acrescenta-se o critério de escolha.
- **Linting com informação de tipos** — a configuração atual usa `tseslint.configs.recommended` (sem
  `projectService`); a regra nova tem de ser puramente sintática, não se ativa type-aware linting nesta
  issue.
- **Nenhuma persistência** — sem `localStorage`/`sessionStorage`, sem cookies, sem `TransferState`.
  Um refresh perde a sessão, por desenho (RGPD).
- **Nenhuma rota, guard ou componente** — nada de UI de login; nada em `features/`, `app.routes.ts` ou
  `app.config.ts`.

## Riscos identificados

**R1 — O token vem embrulhado num envelope e o store não o desembrulha.**
`Token` no contrato é `{ data?: { token?: string } }` (`api.generated.ts:1872-1877`) — o valor útil é
`Token['data']['token']`, de tipo `string | undefined`. O store recebe `string` já desembrulhada; a
extração e a verificação de que existe são responsabilidade do futuro serviço de autenticação, que é
quem fala HTTP. Se essa fronteira não ficar explícita na documentação, o `| undefined` acaba por
escorregar para dentro do estado e `estaAutenticado` passa a ter três valores em vez de dois.

**R2 — Registar uma string vazia produz uma sessão "autenticada" sem credencial utilizável.**
Sendo o predicado a simples presença de token, `registarSessao('')` deixa a app em estado autenticado
com um header `Authorization` inútil. O store não valida a forma do token por desenho; cabe ao chamador
não registar o que não recebeu. Vale a pena que a documentação o diga em vez de o deixar implícito.

**R3 — O bearer token fica acessível a toda a aplicação, e a barreira é só de lint.**
Sendo um singleton auto-provido, qualquer componente pode injetar o store e ler o signal do token —
**o Angular não tem visibilidade por consumidor em runtime**. A mitigação decidida (regra ESLint que
só autoriza a leitura em `core/interceptors/**`) responde à preocupação registada na secção RGPD/NIS2
da issue ("só o interceptor de auth o ler"), mas é uma barreira de análise estática: cai com um
`// eslint-disable-next-line`, e não protege código que não passe pelo lint. O que garante é que a
leitura indevida rebenta o gate de CI e fica visível em revisão, em vez de passar despercebida.
Restante mitigação, já por desenho: sem persistência, sem exposição em disco.

**R4 — Store sem consumidores é store por validar.**
Nada na app vai usar este store até existir o serviço de autenticação. O único exercício real da API
vão ser os testes — que por isso têm de verificar comportamento (o valor registado persiste, o derivado
reage, o encerramento repõe o estado inicial), não apenas que os métodos existem.

## Questões em aberto

Nenhuma — todas resolvidas no Checkpoint A e registadas em "Decisões fechadas no planeamento".

Fica para acompanhamento fora deste Brief, sem bloquear a implementação: o CA-02 da issue fala em
"bearer token" em leitura readonly e o CA-05 em `autenticado`; os nomes efetivos são
`tokenParaAutorizacao` e `estaAutenticado`. A issue acompanha antes do PR.
