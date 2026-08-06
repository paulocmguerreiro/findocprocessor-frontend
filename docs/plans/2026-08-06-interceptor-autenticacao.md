# Plano: interceptor de autenticação — injetar bearer token da SessaoAtivaStore

**Issue:** #10
**Spec:** docs/specs/2026-08-06-interceptor-autenticacao.md
**Data:** 2026-08-06

## Tarefas

### Tarefa 1 — Interceptor `bearerTokenInterceptor` + registo + cobertura

- Ficheiros a criar/alterar:
  - Criar `src/app/core/interceptors/bearer-token.interceptor.ts`
  - Criar `src/app/core/interceptors/bearer-token.interceptor.spec.ts`
  - Alterar `src/app/app.config.ts`
  - Alterar `angular.json` (target `test`, `coverageInclude`)
- O que implementar:
  - `bearerTokenInterceptor: HttpInterceptorFn` — `inject(SessaoAtivaStore)`; se `estaAutenticado() && tokenParaAutorizacao()` (truthy), `return next(req.clone({ setHeaders: { Authorization: 'Bearer ' + tokenParaAutorizacao() } }))`; caso contrário `return next(req)` sem clonar (RF-01, RF-02, RN-01, RN-02).
  - `app.config.ts` — `provideHttpClient(withInterceptors([bearerTokenInterceptor]))` (RF-03).
  - `angular.json` — `coverageInclude: ["src/app/app.ts", "src/app/state/**/*.ts", "src/app/core/interceptors/**/*.ts"]` (RNF-03, CA-06).
- Testes associados:
  - `bearer-token.interceptor.spec.ts` com `TestBed` (`provideHttpClientTesting()` + `provideHttpClient(withInterceptors([bearerTokenInterceptor]))` + `provideZonelessChangeDetection()`), `HttpTestingController`, e `SessaoAtivaStore` real (via `TestBed.inject`, chamando `registarSessao`/`encerrarSessao` para preparar cada cenário):
    - token registado (`registarSessao('abc')`) → pedido tem `Authorization: Bearer abc`.
    - sem sessão (`encerrarSessao()`, token `null`) → pedido sem header `Authorization`.
    - token vazio (`registarSessao('')`) → pedido sem header `Authorization`.
- Commit: `feat(core): interceptor bearerTokenInterceptor injeta bearer token da SessaoAtivaStore`

## Ordem de implementação

1. Tarefa 1 — tarefa única; sem dependências entre camadas (só `core/`), código e testes na mesma tarefa.

## Testes a escrever

| Teste | Tipo | Ficheiro | Verifica |
| ----- | ---- | -------- | -------- |
| `deve_injetar_header_authorization_quando_token_presente` | unit | `bearer-token.interceptor.spec.ts` | RF-01, RN-01, RN-02 |
| `nao_deve_injetar_header_quando_token_null` | unit | `bearer-token.interceptor.spec.ts` | RF-02, CA-02 |
| `nao_deve_injetar_header_quando_token_vazio` | unit | `bearer-token.interceptor.spec.ts` | RF-02, RN-01, CA-02 |

## Dependências

- Issues bloqueantes: nenhuma
- Deve ser implementada após: nenhuma

## Riscos de implementação

> Consolidados do Brief e da Spec.

- Cobertura silenciosamente não medida se `coverageInclude` não for alargado na mesma tarefa que cria o ficheiro (Brief; RNF-03; CA-06).
- Composição de providers em falta no `TestBed` (`provideHttpClientTesting()` + `provideHttpClient(withInterceptors([...]))`) faz o interceptor não disparar durante o teste, mascarando falhas (Brief).
- Esquecer `req.clone(...)` e mutar `req` diretamente falha em silêncio — sem erro de compilação nem de runtime, só o header ausente (Brief; RN-02).
- Disclosure do bearer token a uma origem de terceiros, por não haver scoping por `API_URL` — risco aceite conscientemente (RN-03); fora de âmbito mitigar aqui.

## O que NÃO fazer nesta issue

- Não implementar `InjectionToken<string> API_URL` nem qualquer scoping do interceptor por esse token.
- Não implementar renovação/refresh de token, retry em 401, nem logout automático em token expirado.
- Não implementar `errorInterceptor` (409 → toast) — issue distinta.
- Não implementar o serviço de login que preenche `SessaoAtivaStore.registarSessao(...)`.
- Não atualizar `docs/system_spec/*.md` nesta fase — é da Fase 3a (`atualiza-spec`).
