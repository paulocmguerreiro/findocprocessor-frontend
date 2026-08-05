# Configuração

## `app.config.ts`

`ApplicationConfig` com providers globais:

- `provideZonelessChangeDetection()` — app zoneless.
- `provideRouter(routes)` — rotas lazy (`05-routes/rotas.md`).
- `provideHttpClient(withInterceptors([errorInterceptor]))` — HTTP + interceptors (`04-core/interceptors.md`).
- `API_URL` — token com factory a partir de `environment` (`04-core/tokens.md`).

## Ambientes (`src/environments/`)

| Ficheiro                 | Uso                          | Versionado? |
| ------------------------ | ---------------------------- | ----------- |
| `environment.ts`         | default (dev)                | sim         |
| `environment.production.ts` | build de produção         | sim         |
| `environment.local.ts`   | overrides locais/segredos    | **não** (gitignored) |

Cada `environment` expõe pelo menos `apiUrl` (base da API), consumido pelo token `API_URL`.

## Build

- `ng build --configuration=production` — build de produção (gate de CI).
- `angular.json` define os targets `build`/`serve`/`test`/`lint`; `styleLanguage: scss`.

## Lint (`eslint.config.js`)

Flat config: `eslint`/`typescript-eslint`/`angular-eslint` para `**/*.ts`, `angular-eslint` (template +
acessibilidade) para `**/*.html`, e `src/app/contrato/**` ignorado por ser gerado.

Além das regras herdadas, há **uma regra de projeto**:

| Regra | Alvo | Onde é desativada |
| ----- | ---- | ----------------- |
| `no-restricted-syntax` — seletor `MemberExpression[property.name="tokenParaAutorizacao"]` | Restringe a leitura do bearer token da sessão | `src/app/core/interceptors/**/*.ts` e `src/app/state/sessao-ativa.store.spec.ts` |

Detalhe e motivo do nome não-renomeável: `04-core/sessao-ativa.md`.

> **Ordem importa.** Em flat config vence o último bloco a aplicar-se — a desativação tem de vir
> **depois** do bloco que define a regra. Invertida, a regra fica ativa em todo o lado.

Linting **sem** informação de tipos (`tseslint.configs.recommended`, sem `projectService`): regras de
projeto novas têm de ser puramente sintáticas.

## Sincronização de contrato

- `npm run sync:contract` (Valet, preferencial) / `npm run sync:contract:github` (fallback via raw do GitHub)
  — regeneram `src/app/contrato/api.generated.ts` (via `npx openapi-typescript`, sem devDep — ver `02-shared/contrato-api.md`).

## Regras
- Nenhum segredo em ficheiros versionados — usar `environment.local.ts`.
- Alterar `package.json`/`angular.json`/`environments` → atualizar este ficheiro (DoD de paridade de config).
