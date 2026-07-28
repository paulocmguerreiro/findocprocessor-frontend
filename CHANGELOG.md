# Changelog — FinDocProcessor Frontend Angular

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [Unreleased]

### Added
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

### Changed
- `CLAUDE.md` estendido (nomenclatura, tipagem, MCP `angular` obrigatório, contrato backend-first,
  `SYSTEM_SPEC_MAP`); alinhado com Angular v22 (Standalone/OnPush são defaults — não escrever explicitamente)
- **Estado/HTTP:** signals são o default (NgRx/RxJS permitidos, com interop `toSignal`/`toObservable`);
  `HttpClient` para leituras **e** mutações (sem `httpResource`)
- **Componentes:** template e estilos **sempre** em ficheiros separados (nunca inline)
- **Grafia AO90** (norma em vigor) em todo o texto e identificadores de domínio
- `src/app/app.ts` deixou de opt-out do OnPush; `eslint.config.js` ignora `src/app/contrato/` (gerado)

### Removed
- Rotas e features especulativas do `system_spec` — documentam-se **quando forem implementadas**

---

_Atualizado pela Fase 3 (`/documenta-implementacao`) após cada Issue._
