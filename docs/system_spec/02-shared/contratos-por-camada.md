# Contratos por Camada

Ordem de dependência: `contrato → models → core → state → features`. Uma camada só depende das anteriores.

## `src/app/contrato/` — contrato de dados (gerado)
- **Fonte:** gerado do `openapi.yaml` do backend (`api.generated.ts`), exposto via ficheiro-índice `src/app/contrato/index.ts`.
- **Contrato:** tipos puros (interfaces, enums, envelope de erro). Sem lógica, sem dependências Angular.
- **Regra:** **100% gerado — não editar à mão.** Nunca redefinir um tipo que existe no contrato. Ver `contrato-api.md`.

## `src/app/models/` — modelos à mão (só-Angular)
- **Conteúdo:** tipos/view-models escritos à mão que **só existem no frontend** e são **partilhados** por várias features (ex: um VM que achata `historico`, tipos de UI de domínio próprio).
- **Regra:** compõem os tipos do `contrato/`, nunca os substituem. Sem lógica, sem dependências Angular. Vazia enquanto não houver necessidade real.
- **Fronteira:** view-models específicos de **uma** feature ficam na feature, não aqui. O que vem da API vive em `contrato/`, nunca aqui.

## `src/app/core/` — services, interceptors, tokens
- **Services** (`core/services/`): acesso HTTP à API; uma responsabilidade cada; `providedIn: 'root'`. Devolvem/consomem tipos de `contrato/`. Sem estado de UI.
- **Interceptors** (`core/interceptors/`): transversais (erros 409 → toast, headers). Ver `04-core/interceptors.md`.
- **Tokens** (`core/`): `InjectionToken` (`API_URL`). Ver `04-core/tokens.md`.
- **Contrato:** core não conhece componentes; expõe APIs tipadas para state/features.

## `src/app/state/` — signal stores
- Estado partilhado da aplicação em stores singleton (`providedIn: 'root'`).
- Consome `core/services`; expõe signals `readonly` + `computed` + métodos de mutação (`set`/`update`).
- **SSE só aqui** (`SseStore`) — nunca em componentes. Ver `04-core/sse.md`.
- **Contrato:** state não conhece componentes; features lêem signals e chamam métodos.

## `src/app/features/` — componentes standalone + rotas
- UI por domínio; lazy `loadComponent()`. Consome `state/` (signals) e, quando necessário, `core/services`.
- **Contrato:** um componente não mantém estado partilhado (isso é do store) nem subscreve SSE.

## `src/app/shared/` — reutilizável transversal
- Componentes/pipes/diretivas partilhados por várias features. Sem lógica de domínio específica.

## Checklist por camada (verificação em `escreve-spec` / triagem)
- contrato: tipo existe no contrato? importado do ficheiro-índice `src/app/contrato`? (modelo à mão só-Angular vai para `src/app/models/`, nunca aqui)
- core: `providedIn: 'root'`? `inject()`? sem estado de UI?
- state: signals `readonly` expostos? SSE isolado no `SseStore`?
- features: standalone (default)? sem estado partilhado local? lazy route?
