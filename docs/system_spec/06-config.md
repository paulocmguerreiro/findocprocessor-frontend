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

## Sincronização de contrato

- `npm run sync:contract` (Valet, preferencial) / `npm run sync:contract:github` (fallback via raw do GitHub)
  — regeneram `src/app/contrato/api.generated.ts` (via `npx openapi-typescript`, sem devDep — ver `02-shared/contrato-api.md`).

## Regras
- Nenhum segredo em ficheiros versionados — usar `environment.local.ts`.
- Alterar `package.json`/`angular.json`/`environments` → atualizar este ficheiro (DoD de paridade de config).
