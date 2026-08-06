# Debrief: interceptor de autenticação — injetar bearer token da SessaoAtivaStore

**Issue:** #10
**Branch:** feat/interceptor-autenticacao
**Data:** 2026-08-06
**Commits:** 2

## O que foi implementado

Interceptor funcional `bearerTokenInterceptor` em `src/app/core/interceptors/`, o primeiro
consumidor da barreira ESLint que já reservava a leitura de `tokenParaAutorizacao` a esta pasta.
Injeta o header `Authorization: Bearer <token>` em todo pedido HTTP quando
`SessaoAtivaStore.estaAutenticado()` é `true` **e** `tokenParaAutorizacao()` devolve uma string não
vazia — a combinação dos dois é necessária porque o store aceita `registarSessao('')` sem rejeitar,
o que deixaria `estaAutenticado()` a `true` com um token inútil. Sem sessão ou com token vazio, o
pedido segue sem alteração, sem clonagem. Registado em `app.config.ts` via
`provideHttpClient(withInterceptors([bearerTokenInterceptor]))`. Sem scoping por `API_URL` — decisão
já tomada na Issue #10 (CA-04), aceite conscientemente enquanto o frontend não chamar origens
externas.

## Ficheiros alterados

| Ficheiro | Tipo de alteração | Notas |
| -------- | ----------------- | ----- |
| `src/app/core/interceptors/bearer-token.interceptor.ts` | criado | `HttpInterceptorFn`; `inject(SessaoAtivaStore)`; `req.clone({ setHeaders: {...} })`, nunca mutação direta |
| `src/app/core/interceptors/bearer-token.interceptor.spec.ts` | criado | 3 testes via `TestBed` com `provideHttpClient(withInterceptors(...))` + `provideHttpClientTesting()` + `SessaoAtivaStore` real: token presente, `null`, `''` |
| `src/app/app.config.ts` | alterado | `provideHttpClient(withInterceptors([bearerTokenInterceptor]))` |
| `angular.json` | alterado | `coverageInclude` do target `test` alargado com `src/app/core/interceptors/**/*.ts` |

## Decisões tomadas

| Decisão | Alternativa considerada | Porquê esta |
| ------- | ----------------------- | ----------- |
| Nome de ficheiro `bearer-token.interceptor.ts` | `bearer-token-interceptor.ts` (produzido antes desta sessão) | Convenção do projeto é `kebab-case` **com** sufixo de tipo separado por ponto (`.interceptor.ts`), não hífen a substituir o ponto — alinhado com `.component.ts`/`.store.ts`/`.service.ts` |
| Condição `estaAutenticado() && tokenParaAutorizacao()` | Verificar só `token.length > 0` (equivalente em resultado) | RN-01 da Spec pede a combinação explícita dos dois sinais — a guarda de sessão (`estaAutenticado`) separada do conteúdo (`tokenParaAutorizacao`) deixa a intenção legível no código, não só no comportamento |
| `coverageInclude` como lista explícita de pastas com specs (`app.ts`, `state/**`, `core/interceptors/**`) | `src/app/**` a excluir só `contrato/` | `07-testing.md` fixa a convenção: alargar o âmbito é decisão consciente de cada issue que cria código numa pasta nova. `src/app/**` apanharia `features/`, `shared/`, `models/` e o resto de `core/` — hoje só `.gitkeep` — e deixaria futuras pastas sem specs entrarem no relatório de cobertura sem decisão explícita, silenciando exatamente o risco que a issue #10 já tinha identificado (Brief) |
| Testes com `SessaoAtivaStore` real via `TestBed.inject`, não mock | Mock/spy do store | O store não tem dependências nem efeitos secundários — usar a instância real testa a composição `provideHttpClient(withInterceptors(...))` + `provideHttpClientTesting()` de ponta a ponta, o risco de composição de providers que o Brief identificava |

## Desvios ao Plano

Nenhum desvio de âmbito. O código produzido antes desta sessão de implementação divergia do Plano em
três pontos, corrigidos no checkpoint da Tarefa 1: nome do ficheiro (ver tabela acima), condição de
injeção sem `estaAutenticado()` explícito, e spec com apenas um teste placeholder (`should be
created`) em vez dos três cenários de CA-05.

## Aprendizagens

**Interceptors funcionais correm dentro de um contexto de injeção só quando entram pela pipeline do
`HttpClient`.** `bearerTokenInterceptor` usa `inject(SessaoAtivaStore)` diretamente no corpo da
função — isto só funciona porque `provideHttpClient(withInterceptors([...]))` estabelece o contexto
de injeção a cada pedido. Chamar a função interceptor fora dessa pipeline (nos testes, se se tentasse
invocá-la diretamente) falharia com `inject() must be called from an injection context` — daí o
spec ter de montar o `TestBed` com o provider chain completo e disparar pedidos via `HttpClient` real,
não invocar `bearerTokenInterceptor` a frio. É o mesmo princípio dos guards funcionais de rota, aqui
aplicado a HTTP.

**Ler dois signals dentro do interceptor é síncrono e não tem nada a ver com zoneless.** Tanto
`estaAutenticado()` (um `computed()`) como `tokenParaAutorizacao()` (um `asReadonly()`) resolvem no
mesmo tick em que o pedido HTTP é construído — não há `await`, `whenStable()` nem agendamento
envolvido. O zoneless change detection só entra em jogo quando há *render* de template ou `effect()`
a agendar trabalho; ler estado para decidir o conteúdo de um pedido não passa por nenhum dos dois.
Reforça a distinção já vista no `SessaoAtivaStore`: signals são *pull-based* em qualquer contexto,
não só em componentes.

**A composição de providers no `TestBed` pode mascarar um interceptor que nunca corre.** Sem
`provideHttpClient(withInterceptors([bearerTokenInterceptor]))` **e** `provideHttpClientTesting()`
juntos — e não confundidos com só um dos dois — o `HttpTestingController` intercepta o pedido antes
de o interceptor sequer correr, e os testes passam por o pedido nunca ter header nenhum, não por o
interceptor ter decidido corretamente não o pôr. É um falso positivo que só se deteta ao inverter
deliberadamente uma asserção durante o desenvolvimento e confirmar que o teste falha como esperado.

## SYSTEM_SPEC a atualizar

- `docs/system_spec/04-core/interceptors.md` — adicionar `bearerTokenInterceptor` à tabela
  "Interceptors planeados" (passa a implementado) e o padrão de leitura de signal store dentro de um
  interceptor funcional.
- `docs/system_spec/06-config.md` — refletir `coverageInclude` alargado e o interceptor novo em
  `app.config.ts`.

## Verificação final

- [x] Linter a verde — `ng lint`
- [x] Testes a verde — `ng test --coverage --watch=false` (11 testes, cobertura 100%)
- [x] Build de produção a verde — `ng build --configuration=production`
- [x] Nenhum dado sensível em logs — o interceptor nunca regista o valor do token (RNF-02)
- [x] Nenhum segredo em código — o token é sempre lido em runtime do `SessaoAtivaStore`
- [x] Sem `localStorage`/`sessionStorage`/cookies/`TransferState`
