# Configuração

## `app.config.ts`

`ApplicationConfig` com providers globais:

- `provideZonelessChangeDetection()` — app zoneless.
- `provideRouter(routes)` — rotas lazy (`05-routes/rotas.md`).
- `provideHttpClient(withInterceptors([bearerTokenInterceptor]))` — HTTP + interceptors (`04-core/interceptors.md`).
- `API_URL` — token com factory a partir de `environment` (`04-core/tokens.md`).

## Ambientes (`src/environments/`)

| Ficheiro                 | Uso                          | Versionado? |
| ------------------------ | ---------------------------- | ----------- |
| `environment.ts`         | default (dev)                | sim         |
| `environment.production.ts` | build de produção         | sim         |
| `environment.local.ts`   | overrides locais/segredos    | **não** (gitignored) |

Cada `environment` expõe pelo menos `apiUrl` (base da API), consumido pelo token `API_URL`.
`environment.ts` aponta para o host de Valet do backend (`.../api`, prefixo real das rotas);
`environment.production.ts` usa `apiUrl: '/api'` relativo — mesma origem, sem host fixo.

## Build

- `ng build --configuration=production` — build de produção (gate de CI).
- `angular.json` define os targets `build`/`serve`/`test`/`lint`; `styleLanguage: scss`.
- `build.configurations.production.fileReplacements` troca `environment.ts` por
  `environment.production.ts` — ativo por omissão, já que `defaultConfiguration` do target `build` é
  `production`.

## Cobertura (target `test`)

`angular.json`, target `test` (`builder: @angular/build:unit-test`):

```jsonc
"options": {
  "coverage": true,
  "coverageInclude": ["src/app/app.ts", "src/app/state/**/*.ts", "src/app/core/interceptors/**/*.ts", "src/app/core/services/**/*.ts"],
  "coverageExclude": ["src/app/contrato/**"],
  "coverageReporters": ["text"],
  "coverageThresholds": { "statements": 95, "branches": 95, "functions": 95, "lines": 95 }
}
```

devDependency: `@vitest/coverage-v8`. Política de cobertura (âmbito do `coverageInclude`, critério de
calibração dos limiares): `07-testing.md`.

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

## Tema (Angular Material + Tailwind)

Dependencies (`package.json`):

- `@angular/material` + `@angular/cdk` — Angular Material, temado via `mat.theme()` em `styles.scss`
  (paleta `violet`/`blue`, `theme-type: color-scheme`), com `$overrides` a apontar para as custom
  properties de `src/styles/cores.scss`. Padrão de cores/light-dark: `02-shared/tema-cores.md`.
- `tailwindcss` + `@tailwindcss/postcss` + `postcss` — Tailwind CSS v4 via plugin PostCSS, sem ficheiro
  `tailwind.config` (v4 é config-less por omissão). Configuração do plugin em `.postcssrc.json` (raiz
  do projeto):
  ```json
  { "plugins": { "@tailwindcss/postcss": {} } }
  ```
- `src/tailwind.css` — ponto de entrada único do Tailwind (`@import "tailwindcss";`).

`angular.json`, target `build` → `styles`:
```jsonc
"styles": ["src/tailwind.css", "src/styles.scss"]
```
Ordem importa: Tailwind primeiro, `styles.scss` (tema Material + paleta) depois, para as regras do
tema poderem sobrepor-se a utilitários base do Tailwind quando colidirem.

`src/index.html` carrega, via Google Fonts (`<link rel="preconnect">` + stylesheet), a fonte **Roboto**
(pesos 300/400/500) e o pacote **Material Icons** — dependências externas assumidas pelo schematic
`ng add @angular/material`, sem self-host.

## Sincronização de contrato

- `npm run sync:contract` (Valet, preferencial) / `npm run sync:contract:github` (fallback via raw do GitHub)
  — regeneram `src/app/contrato/api.generated.ts` (via `npx openapi-typescript`, sem devDep — ver `02-shared/contrato-api.md`).

## Regras
- Nenhum segredo em ficheiros versionados — usar `environment.local.ts`.
- Alterar `package.json`/`angular.json`/`environments` → atualizar este ficheiro (DoD de paridade de config).
