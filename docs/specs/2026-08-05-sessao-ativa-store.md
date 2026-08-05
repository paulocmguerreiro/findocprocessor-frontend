# Spec: SessaoAtivaStore — estado de sessão ativa (token, estaAutenticado)

**Issue:** #5
**Brief:** docs/briefs/2026-08-05-sessao-ativa-store.md
**Data:** 2026-08-05

## Requisitos funcionais

- **RF-01:** `SessaoAtivaStore` existe em `src/app/state/sessao-ativa.store.ts`, decorado com `@Service()`
  importado de `@angular/core`, sem `providedIn` (implícito) e sem `@Injectable`.
- **RF-02:** O estado é um único signal privado `#token`, do tipo `WritableSignal<string | null>`,
  inicializado a `null`.
- **RF-03:** O token é exposto publicamente em `tokenParaAutorizacao`, obtido por `#token.asReadonly()`.
  Imediatamente acima da declaração existe um comentário que declara o nome como **não-renomeável** e
  indica o motivo: é a âncora da regra ESLint de RF-07, e renomeá-lo desliga a proteção sem que nada
  falhe.
- **RF-04:** `estaAutenticado` é um `computed<boolean>()` derivado de `#token`. Não existe signal
  próprio para este valor.
- **RF-05:** `registarSessao(token: string): void` define `#token` com o valor recebido, via `set()`.
- **RF-06:** `encerrarSessao(): void` repõe `#token` a `null`, via `set()`.
- **RF-07:** `eslint.config.js` ganha uma regra `no-restricted-syntax` com o seletor
  `MemberExpression[property.name="tokenParaAutorizacao"]` e uma mensagem que explica a restrição,
  mais um bloco de configuração posterior com `files: ["src/app/core/interceptors/**/*.ts"]` que a
  desativa nessa pasta. O ficheiro do próprio store e o respetivo `.spec.ts` também têm de conseguir
  ler o signal — a exceção cobre-os igualmente.
- **RF-08:** A documentação é atualizada conforme a secção "SYSTEM_SPEC a atualizar".

## Requisitos não funcionais

- **RNF-01:** TypeScript strict; sem `any` em nenhum ponto do store nem dos testes.
- **RNF-02:** O store não injeta nada (`inject()` não é usado) e não importa de `@angular/common/http`.
- **RNF-03:** Sem `localStorage`, `sessionStorage`, cookies ou `TransferState` — o estado só vive em
  memória e perde-se num refresh.
- **RNF-04:** Testes em `src/app/state/sessao-ativa.store.spec.ts` (Vitest), obtendo a instância por
  `TestBed.inject(SessaoAtivaStore)` com `provideZonelessChangeDetection()`.
- **RNF-05:** O gate completo fica verde: `ng lint`, `ng build --configuration=production`,
  `ng test --watch=false`.
- **RNF-06:** A regra de RF-07 é sintática — não se ativa linting com informação de tipos
  (`projectService`/`recommendedTypeChecked`) nesta issue.

## Contratos de API (se aplicável)

Não aplicável: o store não faz HTTP (CA-06) e não consome nenhuma rota. Fica registada a **origem** do
valor que lhe será entregue no futuro, para fixar a fronteira de responsabilidade:

| Método | Path          | Request               | Response                                  |
| ------ | ------------- | --------------------- | ----------------------------------------- |
| POST   | `/auth/login` | `{ email, password }` | `Token` = `{ data?: { token?: string } }` |

O desembrulhar de `Token['data']['token']` (`string \| undefined`) e a verificação de que existe são do
futuro serviço de autenticação. O store recebe sempre uma `string` já resolvida. Nenhum tipo do
contrato é importado por esta issue.

## Modelo de dados (se aplicável)

Estado interno do store — nenhum ficheiro em `src/app/models/` é criado.

| Campo                  | Tipo                             | Obrigatório | Notas                                                                                 |
| ---------------------- | -------------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| `#token`               | `WritableSignal<string \| null>` | sim         | Privado. Estado único do store; inicial `null`                                        |
| `tokenParaAutorizacao` | `Signal<string \| null>`         | sim         | Público `readonly` (`asReadonly()`). **Nome não-renomeável** — âncora da regra ESLint |
| `estaAutenticado`      | `Signal<boolean>`                | sim         | `computed()` derivado de `#token`; sem estado próprio                                 |

## Regras de negócio

- **RN-01:** `estaAutenticado` é verdadeiro se e só se `#token` não for `null`. Nenhuma validação de
  forma, comprimento, prefixo ou expiração — validar o token é do backend.
- **RN-02:** `registarSessao` **sobrepõe** um token já registado, sem exigir `encerrarSessao` prévio.
  Registar um token novo é a operação de renovação de sessão.
- **RN-03:** `encerrarSessao` é seguro sem sessão ativa: chamado com `#token` a `null`, deixa-o a
  `null` e `estaAutenticado` a falso.
- **RN-04:** O store não rejeita string vazia. `registarSessao('')` deixa a app em estado autenticado
  com uma credencial inútil (R2 do Brief) — não registar o que não se recebeu é responsabilidade do
  chamador, e fica declarado na documentação do store.
- **RN-05:** O token é legível apenas em `src/app/core/interceptors/**`. Qualquer outra leitura de
  `tokenParaAutorizacao` faz `ng lint` falhar.

## Dependências

- Issues bloqueantes: nenhuma.
- Trabalho futuro fora de âmbito, que virá consumir este store: serviço de autenticação
  (`POST /auth/login` → `registarSessao`), interceptor de autenticação (lê `tokenParaAutorizacao` →
  header `Authorization`), serviço de perfil/permissões (`GET /auth/me` — endpoint **inexistente** no
  contrato, dependência backend-first quando essa issue for planeada).

## Questões resolvidas

| Questão (do Brief)                                            | Decisão                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decorador: `@Service()` vs `@Injectable({providedIn:'root'})` | `@Service()`. Critério geral do projeto: `@Service()` quando é root, `@Injectable()` quando não é                                                                                                                           |
| Local do SYSTEM_SPEC para stores "core"                       | `docs/system_spec/04-core/sessao-ativa.md`, por analogia com `04-core/sse.md`. Não se cria secção `08-state/`                                                                                                               |
| Nomenclatura do store                                         | `SessaoAtivaStore` em `state/` — domínio em PT, sufixo técnico `Store` em EN                                                                                                                                                |
| Assinatura de `registarSessao`                                | `registarSessao(token: string): void` — só o token; nome/email/roles ficam para `GET /auth/me`, em issue futura                                                                                                             |
| Predicado de `autenticado`                                    | Autenticado a partir do momento em que existe token (RN-01)                                                                                                                                                                 |
| Nome do derivado                                              | `estaAutenticado`, não `autenticado` — o verbo declara a intenção do `computed()` e torna aferível o valor devolvido                                                                                                        |
| Exposição do token vs. restrição ao interceptor               | Signal `readonly` público (CA-02) **+** regra ESLint a restringir a leitura a `core/interceptors/**`. O Angular não tem visibilidade por consumidor em runtime; a barreira é de análise estática                            |
| Ancoragem do seletor ESLint                                   | Nome distintivo `tokenParaAutorizacao`, em vez de ancorar em `.token` (colidiria com o desembrulhar de `Token['data']['token']` no futuro serviço de autenticação) ou no nome da variável de injeção (falharia em silêncio) |
| `02-shared/padroes-signals.md`                                | Acrescenta-se o critério de escolha do decorador; o exemplo de código do template mantém-se                                                                                                                                 |

## Critérios de aceitação

> Herdados da issue — nunca remover ou reformular os CAs originais sem justificação.

- [ ] **CA-01:** `SessaoAtivaStore` em `src/app/state/sessao-ativa.store.ts`, singleton, signal nativo
      privado (`#token`) com leitura pública **readonly**. _(issue)_
- [ ] **CA-02:** Expõe em leitura readonly o bearer token e o derivado da presença de token, este como
      `computed()` sem signal duplicado. _(issue — nomes efetivos `tokenParaAutorizacao` e
      `estaAutenticado`, por decisão de nomenclatura registada acima; a issue acompanha antes do PR)_
- [ ] **CA-03:** Método `registarSessao(token: string)`. _(issue)_
- [ ] **CA-04:** Método `encerrarSessao()` que limpa o token, repondo o estado a "sem sessão". _(issue)_
- [ ] **CA-05:** Testes unitários (`sessao-ativa.store.spec.ts`): estado inicial, `registarSessao`,
      `encerrarSessao`, e `estaAutenticado` nos dois estados. _(issue)_
- [ ] **CA-06:** Nenhuma chamada HTTP dentro do store — é só custódia de estado. _(issue)_
- [ ] **CA-07:** O store usa `@Service()` e não injeta nenhuma dependência. _(spec)_
- [ ] **CA-08:** Existe comentário adjacente a `tokenParaAutorizacao` a declarar o nome como
      não-renomeável e a explicar que é a âncora da regra ESLint. _(spec)_
- [ ] **CA-09:** A regra ESLint existe e é eficaz: uma leitura de `tokenParaAutorizacao` fora de
      `core/interceptors/**` faz `ng lint` falhar; dentro dessa pasta, passa. _(spec)_
- [ ] **CA-10:** Os testes cobrem, além do exigido em CA-05, que o valor registado persiste em leituras
      sucessivas, que `registarSessao` sobrepõe um token anterior (RN-02) e que `encerrarSessao` é
      seguro sem sessão ativa (RN-03). _(spec)_
- [ ] **CA-11:** Gate completo verde: `ng lint` + `ng build --configuration=production` +
      `ng test --watch=false`. _(spec)_

## SYSTEM_SPEC a atualizar

- **Criar** `docs/system_spec/04-core/sessao-ativa.md` — responsabilidade do store, API pública,
  invariantes (RN-01 a RN-05), fronteira de quem desembrulha o token, e a regra ESLint com o motivo do
  nome não-renomeável.
- **Atualizar** `docs/system_spec/00-index.md` — linha nova na tabela `Core` a apontar para o ficheiro
  acima (obrigatório: ficheiro novo em `system_spec/` → linha no índice, no mesmo commit).
- **Atualizar** `docs/system_spec/02-shared/padroes-signals.md` — secção `## Regras`: (i) critério de
  escolha do decorador (`@Service()` se root, `@Injectable()` caso contrário); (ii) estado privado com
  campo privado nativo do JavaScript (`#token`) em vez do prefixo underscore (`_token`) — sendo
  privado, que o seja também em runtime e não só para o TypeScript. O exemplo de código do template
  acompanha esta segunda alteração.
- **Atualizar** `docs/system_spec/02-shared/contratos-por-camada.md` — as secções `src/app/core/` e
  `src/app/state/` dizem `providedIn: 'root'`; passam a refletir o mesmo critério de decorador, para
  não ficarem a contradizer `padroes-signals.md` e o código desta issue.
- **Atualizar** `docs/system_spec/06-config.md` — registar a regra de lint nova, por paridade de
  configuração (`eslint.config.js` passa a ter uma regra de projeto, não só as de `angular-eslint`).

## Verificação RGPD/NIS2

- **Dados pessoais:** nenhum. Nome, email e roles saíram do âmbito — só o bearer token é guardado, e
  apenas em memória (signal, runtime). Sem persistência entre reloads, por desenho.
- **Superfície de ataque:** o bearer token passa a residir num singleton acessível a toda a aplicação.
  Mitigações desta issue: (i) escrita impossível de fora, por o signal público ser `readonly`;
  (ii) leitura restrita a `core/interceptors/**` pela regra de RF-07, que faz o gate de CI falhar em
  qualquer outro sítio; (iii) sem persistência em disco ou storage do browser. Limite conhecido: a
  restrição é de análise estática e cai perante um `eslint-disable` — protege contra distração, não
  contra intenção. A restrição real de leitura, se vier a ser exigida, implica type-aware linting ou
  inversão do desenho (fora de âmbito, ver Brief).
