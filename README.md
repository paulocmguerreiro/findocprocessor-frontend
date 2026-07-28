# FinDocProcessor — Frontend Angular (WIP)

![Angular 22](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/testes-Vitest-6E9F18?logo=vitest&logoColor=white)
![Licença MIT](https://img.shields.io/badge/licença-MIT-blue)

> Dashboard web para monitorização e gestão do pipeline de processamento de documentos financeiros.
> Arquitetura em [Arquitetura](#arquitetura); consome o contrato REST do backend Laravel (nunca o inventa).

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [`docs/system_spec/00-index.md`](docs/system_spec/00-index.md) | Porta de entrada da spec de arquitetura — abrir sempre primeiro |
| [`docs/system_spec/01-features/`](docs/system_spec/01-features) | Features (componentes, rota, camadas) — documentadas à medida que são construídas |
| [`docs/system_spec/02-shared/`](docs/system_spec/02-shared) | Convenções (nomenclatura, camadas), contrato da API, envelope de erro, estados, padrões |
| [`docs/system_spec/03-models/`](docs/system_spec/03-models) | Convenções de models (contrato gerado vs modelos à mão) |
| [`docs/system_spec/04-core/`](docs/system_spec/04-core) | Services HTTP, interceptors, tokens, SSE |
| [`docs/system_spec/05-routes/`](docs/system_spec/05-routes) | Rotas & guards |
| [`docs/system_spec/06-config.md`](docs/system_spec/06-config.md) | Configuração e build targets |
| [`docs/system_spec/07-testing.md`](docs/system_spec/07-testing.md) | Convenções de testes (Vitest) |
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md) | Workflow de desenvolvimento assistido por IA (Commands → Skills → Agents), fases e checkpoints |
| [`docs/process-warnings.md`](docs/process-warnings.md) | Avisos de processo — verificar no início de cada sessão |
| [`CHANGELOG.md`](CHANGELOG.md) | Histórico de alterações por issue/versão |

## Stack

- **Angular 22** / TypeScript strict mode (sem `any`)
- **Signals nativos** como abordagem por omissão para estado · **Signal Forms** (estável em v22)
- **RxJS / NgRx** quando acrescentam valor (streams, operadores como `debounceTime`/`takeUntilDestroyed`, efeitos) — interop com signals via `toSignal()`/`toObservable()`
- **Standalone components** + **OnPush** (defaults em v22 — não escritos explicitamente)
- **Zoneless change detection** (`provideZonelessChangeDetection()`)
- **HttpClient** para leituras e mutações (sem `httpResource`)
- **SCSS**; template e estilos sempre em ficheiros separados
- **Vitest** (runner por omissão desde Angular 21)
- Tipos da API **gerados** do contrato do backend (`openapi-typescript`)

## Arquitetura

```
src/app/contrato/      ← Tipos GERADOS do contrato do backend (não editar): api.generated.ts + camada por recurso + index.ts
src/app/models/        ← Modelos escritos à mão, só-Angular (view-models partilhados) — vazia até haver necessidade
src/app/core/          ← Services, interceptors, tokens
src/app/state/         ← Signal stores
src/app/features/      ← Componentes standalone por domínio (lazy)
src/app/shared/        ← Componentes, pipes, diretivas partilhados
```

Camadas: `contrato (gerado) → models (à mão) → core → state → features`. Desenho e regras completas em
[`docs/system_spec/`](docs/system_spec/00-index.md).

## Como correr (dev)

```bash
npm install
ng serve
```

Dashboard disponível em `http://localhost:4200`.

## Sincronização de contrato (API)

Os tipos de dados da API (rotas, resources, enums, envelope) são **gerados** a partir do `openapi.yaml`
do backend Laravel — a **fonte de verdade única**. O Angular nunca inventa contrato: se falta algo,
prepara-se primeiro no backend.

```bash
npm run sync:contract          # preferencial: Valet http://findocprocessor-backend-laravel.test/openapi.yaml
npm run sync:contract:github   # fallback: raw.githubusercontent.com/paulocmguerreiro/findocprocessor-backend-laravel/main/openapi.yaml
```

Tudo em `src/app/contrato/` é gerado (não editar). Detalhe:
[`docs/system_spec/02-shared/contrato-api.md`](docs/system_spec/02-shared/contrato-api.md).

## Testes e qualidade

Gates de CI (a mesma sequência corre localmente antes de publicar):

```bash
ng lint                              # ESLint + angular-eslint
ng build --configuration=production  # build de produção
ng test --watch=false                # Vitest
```

## Workflow (desenvolvimento assistido por IA)

Cada issue percorre Brief → Spec → Plano → Código → Testes → Debrief → SYSTEM_SPEC → Changelog → PR,
com checkpoints humanos obrigatórios. O workflow (Commands → Skills → Agents) **não** é explicado aqui —
detalhe completo em [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

## Relacionado

- [`findocprocessor-backend-laravel`](https://github.com/paulocmguerreiro/findocprocessor-backend-laravel) — Backend Laravel (fonte de verdade do contrato da API)

## Licença

[MIT](LICENSE) © Paulo Guerreiro
