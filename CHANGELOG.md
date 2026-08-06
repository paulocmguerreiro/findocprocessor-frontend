# Changelog — FinDocProcessor Frontend Angular

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased]

### Added
- **`SessaoAtivaStore`** (`src/app/state/`) — primeiro signal store do projeto: guarda o bearer token da
  sessão em memória (sem persistência), expõe-o em leitura readonly e deriva `estaAutenticado` por
  `computed()`. Sem HTTP e sem dependências injetadas (#5)
- Regra de lint de projeto que restringe a leitura do bearer token a `src/app/core/interceptors/**` —
  qualquer outra leitura faz `ng lint` (e o CI) falhar (#5)
- Estrutura inicial do projeto (scaffolding) e **workflow assistido por IA** adaptado do backend Laravel
  (fonte canónica): comandos (`/cria-issue`, `/planeia-issue`, `/implementa-plano`,
  `/documenta-implementacao`, `/publica-implementacao`, `/mostra-workflow`) e skills reais em `.claude/`,
  com ações específicas do Angular (`ng test`, `ng lint`/`ng build`, MCP `angular`)
- Skills de stack: `angular-best-practices` (Standalone, Signals, OnPush, zoneless, v22) e `vitest-testing`
- Sincronização de contrato **backend-first**: `npm run sync:contract` / `sync:contract:github` obtêm o
  `openapi.yaml` do backend **por URL** (Valet / GitHub raw — nunca ficheiro sibling) e geram
  `src/app/contrato/` (`openapi-typescript` + `scripts/gen-models.mjs`) — um ficheiro por recurso +
  `enums.ts`/`errors.ts` + ficheiro-índice `index.ts`, todos com cabeçalho de "ficheiro gerado"
- Separação **`src/app/contrato/`** (100% gerado) vs **`src/app/models/`** (modelos escritos à mão, só-Angular)
- `docs/system_spec/` reestruturado em hierarquia (`00-index` + `01-features/` + `02-shared/` +
  `03-models/` + `04-core/` + `05-routes/` + `06-config` + `07-testing`), `docs/WORKFLOW.md` e
  `docs/process-warnings.md` (aviso PW-001)

### Added
- Cobertura de testes no target `test` (`@vitest/coverage-v8`) — `coverageInclude` restrito ao código
  já testado, `coverageExclude` a `src/app/contrato/**`, limiares a 95% (#8)
- **`bearerTokenInterceptor`** (`src/app/core/interceptors/`) — interceptor funcional que injeta
  `Authorization: Bearer <token>` a partir do `SessaoAtivaStore` em todo pedido HTTP quando há sessão
  ativa com token não vazio; registado em `app.config.ts` via `provideHttpClient(withInterceptors([...]))`;
  `coverageInclude` alargado a `src/app/core/interceptors/**/*.ts` (#10)

### Changed
- Gate de CI: `ng test --watch=false` → `ng test --coverage --watch=false` (#8)
- `CLAUDE.md` estendido (nomenclatura, tipagem, MCP `angular` obrigatório, contrato backend-first,
  `SYSTEM_SPEC_MAP`); alinhado com Angular v22 (Standalone/OnPush são defaults — não escrever explicitamente)
- **Estado/HTTP:** signals são o default (NgRx/RxJS permitidos, com interop `toSignal`/`toObservable`);
  `HttpClient` para leituras **e** mutações (sem `httpResource`)
- **Componentes:** template e estilos **sempre** em ficheiros separados (nunca inline)
- **Grafia AO90** (norma em vigor) em todo o texto e identificadores de domínio
- `src/app/app.ts` deixou de opt-out do OnPush; `eslint.config.js` ignora `src/app/contrato/` (gerado)
- **Padrão de signal store** (`02-shared/padroes-signals.md`): decorador passa a `@Service()` quando é
  root (`@Injectable()` caso contrário), estado privado em campo privado nativo (`#nome`, não `_nome`)
  e leitura pública por `asReadonly()` em vez de `computed()` (#5)

### Removed
- Rotas e features especulativas do `system_spec` — documentam-se **quando forem implementadas**

---

_Atualizado pela Fase 3 (`/documenta-implementacao`) após cada Issue._
