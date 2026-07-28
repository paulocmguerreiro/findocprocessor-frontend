---
name: angular-best-practices
description: "Apply this skill whenever writing, reviewing, or refactoring Angular TypeScript code. This includes creating or modifying standalone components, signal stores, services, interceptors, injection tokens, routes, pipes, directives, and typed/Signal forms. Triggers for change-detection and zoneless concerns, OnPush, signals & computed state, RxJS/HttpClient/httpResource, lazy loading, accessibility (WCAG AA / AXE), and architectural decisions. Also use for Angular code reviews and refactoring existing Angular code to follow modern (v22) best practices. Covers any task involving Angular frontend code patterns."
license: MIT
metadata:
  author: angular
---

# Angular Best Practices (v22)

Best practices for Angular 22, prioritized by impact. Each rule teaches what to do and why. For exact API syntax and version-specific behaviour, verify with the MCP `angular`.

## Pré-condição obrigatória — MCP `angular`

Antes de gerar ou alterar qualquer código, executar obrigatoriamente:

1. `get_best_practices` — carrega os standards da versão instalada (v22). **Fonte da verdade** — se algo aqui divergir do output do MCP, o MCP ganha.
2. `search_documentation` — 1-2 queries temáticas relevantes ao contexto (ex: `signal inputs`, `HttpClient`, `control flow`, `signal forms`).

Não saltar este passo. O código gerado sem consultar o MCP pode usar APIs incorretas ou padrões antigos (NgModule, `*ngIf`, decorators de input/output) para a versão instalada.

## Consistency First

Antes de aplicar qualquer regra, verificar o que a aplicação já faz. O melhor padrão é o que o codebase já usa, mesmo que outro seja teoricamente melhor. Inconsistência é pior que um padrão subótimo. Verificar ficheiros-irmãos (componentes, stores, services, testes). Estas regras são defaults para quando ainda não há padrão, não overrides.

## Quick Reference

### 1. Standalone & estrutura → `rules/components.md`

- **Standalone é o default (v20+)** — **não** escrever `standalone: true`. Nunca reintroduzir `NgModule`.
- **OnPush é o default (v22+)** — **não** escrever `changeDetection: ChangeDetectionStrategy.OnPush`. Nunca voltar a `Default`.
- Componentes pequenos, uma responsabilidade; template e estilos **sempre em ficheiros separados** (`templateUrl`/`styleUrl`) — nunca inline.
- `input()` / `output()` (funções), nunca `@Input()`/`@Output()` decorators.
- `inject()` em vez de injeção por construtor.
- Host bindings no objeto `host` do decorator — nunca `@HostBinding`/`@HostListener`.

### 2. Signals & estado → `rules/signals-state.md`

- `signal()` para estado local; `computed()` para estado derivado; `update()`/`set()` — **nunca** `mutate()`.
- Transformações puras e previsíveis.
- Signal stores singleton em `state/` (`providedIn: 'root'`) — o estado partilhado vive aqui, não nos componentes.
- **SSE nunca subscrito em componentes** — apenas no `SseStore` (ver `docs/system_spec/04-core/sse.md`).

### 3. Change detection & zoneless → `rules/change-detection-zoneless.md`

- App **zoneless** (`provideZonelessChangeDetection()`). Não depender de Zone.js; não usar `NgZone.run`.
- Estado reativo por signals — mutações fora de signals podem não disparar CD.
- `NgOptimizedImage` para imagens estáticas (não funciona para base64 inline).

### 4. HTTP, services & contrato → `rules/http-services.md`

- `@Service` (v22+) ou `@Injectable({ providedIn: 'root' })` para singletons.
- `HttpClient` via `provideHttpClient(withInterceptors(...))` para **leituras e mutações** (GET/POST/PUT/DELETE). Neste projeto **não** se usa `httpResource`/`resource`.
- `InjectionToken<string>` para `API_URL` — nunca URL hardcoded.
- Erros 409 tratados globalmente no `ErrorInterceptor` → toast (ver `docs/system_spec/02-shared/envelope-http.md`).
- **Tipos da API são gerados** a partir do `openapi.yaml` do backend (`src/app/contrato/api.generated.ts`) — nunca redefinir models/enums/envelope à mão. Contrato é backend-first (ver `docs/system_spec/02-shared/contrato-api.md`).
- `multipart/form-data` no upload — nunca base64 em JSON.

### 5. Templates & control flow → `rules/templates-accessibility.md`

- Control flow nativo (`@if`, `@for`, `@switch`) — nunca `*ngIf`/`*ngFor`/`*ngSwitch`.
- `@for` com `track` obrigatório.
- `class`/`style` bindings — **nunca** `ngClass`/`ngStyle`.
- Templates simples, sem lógica complexa; `async` pipe para observables.

### 6. Acessibilidade → `rules/templates-accessibility.md`

- Passar todos os checks AXE; cumprir WCAG AA (gestão de foco, contraste de cor, atributos ARIA).

### 7. Forms → `rules/forms.md`

- Preferir **Signal Forms** (`@angular/forms/signals`, estável em v22) para forms novos — estado por signals, acesso tipado, validação por schema.
- Sem Signal Forms → Reactive Forms tipados (nunca Template-driven).

### 8. Routing → `rules/routing.md`

- Lazy loading por rota via `loadComponent()` em `app.routes.ts`.
- Sem guards em v1.0 (app sem autenticação) — ver `docs/system_spec/05-routes/`.

### 9. Segurança & conformidade → `rules/security.md`

- **Nunca** `localStorage`/`sessionStorage` (nenhum dado sensível no browser).
- Upload sempre `multipart/form-data`.
- Sem `any`; `unknown` quando o tipo é incerto; strict mode sempre.

### 10. TypeScript

- Strict type checking; inferência quando o tipo é óbvio; evitar `any`.

## How to Apply

Usar sempre um sub-agente para ler os ficheiros de regras e explorar o conteúdo desta skill.

1. **MCP pré-condição** — `get_best_practices` + `search_documentation` (ver seção "Pré-condição obrigatória").
2. Identificar o tipo de ficheiro e seleccionar as seções relevantes (ex: componente → §1, §3, §5, §6; service → §4; store → §2).
3. Verificar ficheiros-irmãos para padrões existentes — seguir esses primeiro (Consistency First).
4. Confirmar a sintaxe da API com `search_documentation` para a versão instalada.
