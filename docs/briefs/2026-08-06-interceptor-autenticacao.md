# Brief: interceptor de autenticação — injetar bearer token da SessaoAtivaStore

**Issue:** #10
**Data:** 2026-08-06
**Branch:** feat/interceptor-autenticacao

## Contexto

O `SessaoAtivaStore` guarda o bearer token da sessão em memória (`tokenParaAutorizacao`, `Signal<string | null>`), mas nada na aplicação o lê ainda — `provideHttpClient(withInterceptors([]))` está vazio em `app.config.ts`. O backend (Sanctum da Spatie) foi validado: `POST auth/login` devolve `{ data: { token } }`, e as rotas protegidas usam `auth:sanctum`, que aceita bearer token no header `Authorization` quando não há sessão stateful — o fluxo é bearer-token, não cookies de SPA. Falta o interceptor que liga `SessaoAtivaStore` ao `HttpClient`.

O `eslint.config.js` já reserva a leitura de `tokenParaAutorizacao` a `src/app/core/interceptors/**` (regra `no-restricted-syntax`) — este interceptor é o consumidor que essa regra antecipa.

## O que muda

- Novo ficheiro `src/app/core/interceptors/bearer-token.interceptor.ts` — `HttpInterceptorFn` `bearerTokenInterceptor` que injeta `Authorization: Bearer <token>` quando `SessaoAtivaStore.tokenParaAutorizacao()` tem valor não vazio. Nome específico (não `authInterceptor`) porque vão existir outros interceptors com responsabilidade própria na mesma pasta (ex.: `errorInterceptor`, já documentado como "pendente") — um nome genérico "auth" colidiria semanticamente com um futuro interceptor de fluxo de autenticação (ex.: tratamento de 401/expiração).
- Validação antes de anexar o header: combinar `estaAutenticado()` (guarda de sessão) com o valor de `tokenParaAutorizacao()` (conteúdo) — necessário porque o store não rejeita string vazia (`registarSessao('')` deixa `estaAutenticado()` a `true` com token inútil), por isso `estaAutenticado()` sozinho não chega para cumprir CA-02.
- `src/app/app.config.ts` — regista o interceptor em `provideHttpClient(withInterceptors([bearerTokenInterceptor]))`.
- Novo ficheiro de teste `src/app/core/interceptors/bearer-token.interceptor.spec.ts`.
- `angular.json` (target `test`, `coverageInclude`) — precisa de alargar para apanhar `src/app/core/interceptors/**`, hoje restrito a `src/app/app.ts` + `src/app/state/**`.

## O que NÃO muda

- `SessaoAtivaStore` não é alterado — já expõe tudo o necessário (`tokenParaAutorizacao`, `estaAutenticado`, `registarSessao`, `encerrarSessao`).
- Nenhuma rota, componente, serviço de login (`POST /auth/login`) ou de perfil/permissões nesta issue.
- `errorInterceptor` (409 → toast) continua "pendente", é issue à parte.
- Sem scoping do header por `API_URL` — aplica-se a todos os pedidos HTTP. Decisão já tomada na Issue #10 (CA-04): `API_URL` como `InjectionToken` real ainda não existe no código, só documentado.

## Riscos identificados

- **Disclosure do token a terceiros:** como o interceptor se aplica a todos os pedidos HTTP sem scoping por `API_URL`, qualquer chamada futura a uma origem que não seja o backend Laravel levaria o bearer token no header `Authorization`. Risco aceite conscientemente (Issue #10, CA-04, reconfirmado no Checkpoint A) porque hoje não existe nenhuma chamada a terceiros no frontend — a reavaliar se/quando isso mudar.
- **Cobertura silenciosamente não medida:** `coverageInclude` do target `test` (`angular.json:78`) está hoje restrito a `src/app/app.ts` + `src/app/state/**/*.ts`. Sem o alargar para `src/app/core/interceptors/**`, o novo interceptor e o seu spec não entram no relatório `@vitest/coverage-v8` nem no limiar de 95% — o gate passa a verde sem medir o ficheiro novo, dando falso sentido de segurança.
- **Composição de providers no teste:** testar um `HttpInterceptorFn` que lê um signal store exige `provideHttpClientTesting()` + `provideHttpClient(withInterceptors([authInterceptor]))` no mesmo `TestBed` — se faltar um dos dois, ou a ordem estiver errada, o interceptor não dispara durante o teste e os testes passam "por acidente" sem exercitar o código real (risco confirmado na doc oficial "Testing an Interceptor").
- **`HttpRequest` é imutável:** adicionar o header exige `req.clone({ setHeaders: {...} })`, nunca mutar `req` diretamente — um erro fácil de cometer e que falha silenciosamente (o header simplesmente não aparece no pedido, sem erro de compilação nem de runtime).

## Questões em aberto

Nenhuma — a única decisão de âmbito pendente (aplicar a todos os pedidos vs. scoping por `API_URL`) já foi resolvida na Issue #10 (CA-04): aplica-se a todos os pedidos, sem scoping.
