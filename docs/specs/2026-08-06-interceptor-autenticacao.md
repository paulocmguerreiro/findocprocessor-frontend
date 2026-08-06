# Spec: interceptor de autenticação — injetar bearer token da SessaoAtivaStore

**Issue:** #10
**Brief:** docs/briefs/2026-08-06-interceptor-autenticacao.md
**Data:** 2026-08-06

## Requisitos funcionais

- RF-01: O interceptor funcional `bearerTokenInterceptor` (`HttpInterceptorFn`) injeta o header `Authorization: Bearer <token>` em pedidos HTTP saídos do `HttpClient` quando `SessaoAtivaStore.estaAutenticado()` é `true` e `SessaoAtivaStore.tokenParaAutorizacao()` devolve uma string não vazia.
- RF-02: Quando `tokenParaAutorizacao()` é `null` ou `''`, o pedido segue sem alteração — sem header `Authorization` adicionado, sem clonagem desnecessária do request.
- RF-03: O interceptor é registado em `app.config.ts` via `provideHttpClient(withInterceptors([bearerTokenInterceptor]))`.

## Requisitos não funcionais

- RNF-01: Interceptor puro/funcional (sem estado próprio) — injeta `SessaoAtivaStore` via `inject()`.
- RNF-02: Sem logging do valor do token em nenhuma circunstância (console, erro, telemetria).
- RNF-03: `angular.json` (target `test`) — `coverageInclude` alargado para `src/app/core/interceptors/**/*.ts`, mantendo (ou recalibrando, se a cobertura real ficar abaixo) o limiar atual de 95%.

## Contratos de API (se aplicável)

N/A — não consome rota/schema novo do backend; usa apenas o header HTTP `Authorization`, mecanismo padrão do Sanctum já validado (ver Brief).

## Modelo de dados (se aplicável)

N/A — não introduz model/interface novo. Consome `SessaoAtivaStore.tokenParaAutorizacao: Signal<string | null>` já existente.

## Regras de negócio

- RN-01: Condição de injeção = `estaAutenticado() && tokenParaAutorizacao()` (ambos truthy). Necessário combinar os dois porque o store aceita `registarSessao('')` sem rejeitar — nesse caso `estaAutenticado()` fica `true` com token vazio; validar o conteúdo evita anexar `Authorization: Bearer ` vazio (cumpre CA-02).
- RN-02: Clonagem via `req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })` — nunca mutar `req` diretamente (`HttpRequest` é imutável).
- RN-03: Aplica-se a **todos** os pedidos HTTP, sem scoping por URL/origem — decisão CA-04 da issue, reconfirmada no Checkpoint A. Risco de disclosure do token a uma origem de terceiros aceite conscientemente enquanto o frontend não fizer chamadas externas.

## Dependências

- Issues bloqueantes: nenhuma

## Questões resolvidas

| Questão (do Brief) | Decisão |
| --- | --- |
| _(nenhuma questão em aberto no Brief)_ | — |

## Critérios de aceitação

> Herdados da issue; CA-01 e CA-03 ajustados no Checkpoint A (nome do interceptor); CA-06 acrescentado no Checkpoint A.

- [ ] CA-01: Interceptor funcional `bearerTokenInterceptor` em `src/app/core/interceptors/bearer-token.interceptor.ts`, injeta `Authorization: Bearer <token>` quando `tokenParaAutorizacao()` tem valor não vazio. _(issue, nome ajustado no Checkpoint A — era `authInterceptor`)_
- [ ] CA-02: Token `null` ou `''` → pedido inalterado, sem header. _(issue)_
- [ ] CA-03: Injeta `SessaoAtivaStore` via `inject()`; registado em `app.config.ts` via `provideHttpClient(withInterceptors([bearerTokenInterceptor]))`. _(issue, símbolo ajustado)_
- [ ] CA-04: Aplica-se a todos os pedidos HTTP, sem scoping por `API_URL`. _(issue)_
- [ ] CA-05: Testes unitários (Vitest + `HttpTestingController`) cobrindo: token presente → header correto; `null` → sem header; `''` → sem header. _(issue)_
- [ ] CA-06: `angular.json` `coverageInclude` alargado para `src/app/core/interceptors/**/*.ts` — o novo ficheiro e o seu spec entram efetivamente no relatório de cobertura. _(spec, do Checkpoint A)_

## SYSTEM_SPEC a atualizar

- `docs/system_spec/04-core/interceptors.md` — adicionar `bearerTokenInterceptor` à tabela "Interceptors planeados".
- `docs/system_spec/06-config.md` — refletir `coverageInclude` alargado e o interceptor novo em `app.config.ts`.
> Nota: por regra do `escreve-plan`, esta atualização de `system_spec` acontece só na Fase 3a (`atualiza-spec`), não no Plano desta fase.

## Verificação RGPD/NIS2

- Dados pessoais: o bearer token é uma credencial de sessão — nunca em logs/console/mensagens de erro (RNF-02).
- Superfície de ataque: alterada — todo pedido HTTP passa a poder transportar a credencial de autorização. Risco de disclosure a terceiros aceite conscientemente (RN-03); reavaliar scoping por `API_URL` se o frontend passar a chamar origens externas.
