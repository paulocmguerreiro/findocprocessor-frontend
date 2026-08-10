# Debrief: AutenticacaoService — login/logout via SessaoAtivaStore

**Issue:** #12
**Branch:** feat/autenticacao-service
**Data:** 2026-08-10
**Commits:** 5 commits (desde `600a4bd`, a última da Fase 1)

## O que foi implementado

- `API_URL` (`InjectionToken<string>`) e `src/environments/{environment,environment.production}.ts`,
  ligados por `fileReplacements` na configuração `production` do `angular.json`.
- `coverageInclude` do target `test` alargado a `src/app/core/services/**/*.ts`.
- Sincronização do contrato a partir do `openapi.yaml` do backend: promoveu o envelope de sucesso e o
  envelope paginado a schemas nomeados (`EnvelopeToken`, `EnvelopeDocumento`, `EnvelopePaginado*`,
  `LinksPaginacao`, `MetaPaginacao`, ...), antes inline em cada operação.
- `AutenticacaoService` (`src/app/core/services/autenticacao.service.ts`): `efetuarAutenticacao()`
  (`POST /auth/login`) e `terminarSessao()` (`POST /auth/logout`), com os efeitos sobre o
  `SessaoAtivaStore` dentro do stream (`tap`/`catchError`).
- Spec e plano da #12 revistos para refletir o contrato atual (remoção do CA-12, ajuste do CA-15).

## Ficheiros alterados

| Ficheiro | Tipo de alteração | Notas |
| -------- | ----------------- | ----- |
| `src/environments/environment.ts` | criado | `apiUrl` de dev (host Valet) |
| `src/environments/environment.production.ts` | criado | `apiUrl: '/api'` relativo |
| `src/app/core/api-url.token.ts` | criado | `InjectionToken<string>`, `providedIn: 'root'` |
| `angular.json` | alterado | `fileReplacements` (produção) + `coverageInclude` (`core/services/**`) |
| `src/app/contrato/**` | regenerado | `EnvelopeToken` e restantes envelopes/paginação nomeados |
| `docs/system_spec/02-shared/contrato-api.md` | alterado (commit `668eaed`, fora desta branch) | sincronização anterior, 2026-08-07 |
| `docs/specs/2026-08-06-autenticacao-service.md` | alterado | `EnvelopeToken`/`PedidoAutenticacao`, CA-12 removido, CA-15 ajustado |
| `docs/plans/2026-08-06-autenticacao-service.md` | alterado | Tarefa 3 alinhada com os tipos atuais |
| `src/app/core/services/autenticacao.service.ts` | criado | `@Injectable()` sem `providedIn: 'root'` |
| `src/app/core/services/autenticacao.service.spec.ts` | criado | 13 testes, `HttpTestingController` + duplo do `SessaoAtivaStore` |

## Decisões tomadas

| Decisão | Alternativa considerada | Porquê esta |
| ------- | ----------------------- | ----------- |
| `@Injectable()` sem `providedIn: 'root'` | `@Service()` (atalho v22 para singleton root) | CA-01 exige explicitamente que o serviço **não** seja singleton — `@Service()` provisiona automaticamente na raiz (confirmado via `search_documentation`), o que violaria a CA-01 em silêncio |
| Guarda `token === ''` dentro de `tap`, com `throw` síncrono | `switchMap` + `throwError` explícito | O `throw` síncrono num operador RxJS já converte a stream num erro — menos código, mesmo comportamento; evitou uma segunda chamada a `encerrarSessao()` que uma combinação `switchMap`+`catchError` provocaria |
| Método público `terminarSessao()` (não `encerrarSessao()`) | Espelhar o nome do método do store | Colisão de nome com `SessaoAtivaStore.encerrarSessao()` tornaria o código ambíguo a ler; o plano já previa este nome |
| Contrato sincronizado a partir do `openapi.yaml` **local** do backend (branch `refactor/openapi-envelopes-reutilizados`, não publicada) | Esperar o merge/push dessa branch | Decisão do utilizador, em sessão — confirmado depois que o Valet local já serve exatamente esse ficheiro (sem drift ao correr `npm run sync:contract` pelo fluxo canónico) |
| CA-12 removido, CA-15 **mantido** | Remover os dois, como o `workflow-state.md` prévia | `data`/`data.token` obrigatórios no `EnvelopeToken` garantem presença, não garantem não-vazio — `''` continua um valor `string` válido em runtime; só o CA-12 (ausência) deixou de ser possível |
| `API_URL` de teste com valor fixo (`http://api.teste`), via override do provider | Usar o `environment.ts` real (host de Valet) | Desacopla os testes do host de desenvolvimento — `expectOne()` prova a composição do URL, não depende de um valor externo que pode mudar |
| `terminarSessao()` usa `finalize()` (não `tap`/`catchError`) — `encerrarSessao()` corre também no cancelamento | Manter `tap`/`catchError`, simétrico ao login | Levantado em revisão: para o logout, cancelar a meio não deve deixar a app "meio autenticada" — é a RN-03 (logout local não espera confirmação do backend) estendida ao cancelamento. Assimetria deliberada face ao login, onde cancelar **não** deve autenticar (RN-06 continua a aplicar-se só a `efetuarAutenticacao()`) |

## Desvios ao Plano

- O rascunho inicial do serviço (escrito manualmente pelo utilizador) usava `@Service()` e
  `http.post(url, { body: credenciais })` — este último enviava `{ body: ... }` como corpo literal do
  pedido em vez de usar `credenciais`. Ambos corrigidos antes do commit da Tarefa 3; não chegaram a
  ficar no histórico da branch.
- O contrato foi sincronizado a partir de uma branch do backend ainda não publicada, em vez do fluxo
  padrão (Valet servindo `main`, ou GitHub `main` como fallback) — ver decisão acima.
- Uma alteração de formatação incidental em `angular.json` (colapso do array `schematicCollections`
  para uma linha, por autoformatação do editor) entrou no commit da Tarefa 2 junto com o
  `coverageInclude` — sem impacto funcional, não vale um commit à parte.

## Aprendizagens

`@Service()` (novo em v22) não é um sinónimo cosmético de `@Injectable()` — é sempre
`providedIn: 'root'` implícito (com `autoProvided: false` para o desligar), enquanto `@Injectable()`
"nu" não provisiona nada sozinho. Antes desta issue eu tratava os dois como intercambiáveis para
"serviços novos"; a CA-01 (o `AutenticacaoService` tem de ser **não-singleton**, por desenho, porque
duas instâncias em componentes diferentes são aceitáveis enquanto for stateless) só faz sentido com
`@Injectable()` puro. É o mesmo raciocínio dos signal stores do projeto (`SessaoAtivaStore` usa
`@Service()` porque **é** suposto ser singleton) — a escolha do decorator não é estilo, é uma decisão
de ciclo de vida.

Também ficou mais claro o desenho da fronteira entre um service HTTP e um signal store: o
`AutenticacaoService` nunca lê o signal `tokenParaAutorizacao` do `SessaoAtivaStore` (só escreve, via
`registarSessao`/`encerrarSessao`) — o fluxo é estritamente unidirecional (service → store → signal
computado `estaAutenticado`), e essa direção é protegida por uma regra de lint ancorada no nome do
signal, não por encapsulamento de TypeScript. Um store zoneless com signals não impede, por si só, que
qualquer código o leia; a proteção real é arquitetural (convenção + CI), não da linguagem.

## SYSTEM_SPEC a atualizar

- `docs/system_spec/04-core/services.md` — documentar o `AutenticacaoService` e o desvio ao padrão-tipo
  (`@Injectable()` não-root vs `@Service()`/root)
- `docs/system_spec/04-core/tokens.md` — `API_URL` de "pendente" a implementado
- `docs/system_spec/06-config.md` — `environment.ts`/`environment.production.ts` a existir,
  `fileReplacements`, `coverageInclude` alargado
- `docs/system_spec/04-core/sessao-ativa.md` — remover "fora de âmbito" do serviço de autenticação;
  atualizar a forma do `Token`/envelope (já desatualizada face ao contrato atual); nomear o serviço
  concreto na fronteira de desembrulhar o token
- `docs/system_spec/07-testing.md` — nota sobre o âmbito de cobertura alargado
- `docs/system_spec/02-shared/contrato-api.md` — delta de hoje (`EnvelopeToken` e restantes envelopes
  nomeados)

## Verificação final

- [x] Linter a verde
- [x] Testes a verde (23/23, cobertura 100% sobre o `coverageInclude` atual)
- [x] Nenhum dado sensível em logs (teste dedicado — `nao_deve_logar_dados_sensiveis_durante_autenticacao_e_logout`)
- [x] Nenhum segredo em código (`apiUrl` não contém credenciais; token nunca persiste)
