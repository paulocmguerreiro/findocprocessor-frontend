# FinDocProcessor — Frontend Angular

Dashboard web para monitorização e gestão do pipeline de processamento de documentos financeiros. Funciona com qualquer dos backends (dotNET ou Laravel) — só muda a variável `API_URL`.

## Stack

- **Angular 21** / TypeScript strict mode
- **Signals nativos** — sem NgRx
- **Standalone components** — sem NgModule
- **Zoneless change detection**
- **Tailwind CSS**
- **Vitest** (testes)

## Arquitectura

```
src/app/core/          ← Services, interceptors, tokens
src/app/state/         ← Signal stores (document, sse, ui)
src/app/features/      ← Dashboard, Documents, Upload, FileExplorer, Config
src/app/shared/        ← Componentes, pipes, directives partilhados
src/app/models/        ← Interfaces, enums, DTOs
```

## Como correr (dev)

```bash
# Pré-requisitos: Node.js 22+, Angular CLI 21
npm install
ng serve
```

Dashboard disponível em `http://localhost:4200`.

Por defeito aponta para `http://localhost:5000` (backend dotNET).
Para Laravel: `API_URL=http://localhost:8000 ng serve`

## Testes

```bash
ng test --watch=false
```

## Rotas

| Rota         | Descrição                                         |
| ------------ | ------------------------------------------------- |
| `/`          | Análise Financeira — KPIs e gráficos              |
| `/documents` | Upload e Gestão — tabela, drag-and-drop, SSE log  |
| `/config`    | Configuração — extraction templates               |

## Qualidade

- ESLint + `@angular-eslint/recommended`
- TypeScript strict mode
- CI obrigatório: lint ✓ build ✓ testes ✓

## Relacionado

- [`findocprocessor-backend-dotnet`](../findocprocessor-backend-dotnet) — Backend .NET
- [`findocprocessor-backend-laravel`](../findocprocessor-backend-laravel) — Backend Laravel
