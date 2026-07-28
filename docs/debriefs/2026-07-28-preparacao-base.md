# Debrief: Preparação base do stack Angular + workflow assistido por IA

**Issue:** #1
**Branch:** chore/preparacao-base-stack
**Data:** 2026-07-28
**Commits:** 6 (agrupados por camada)

## O que foi implementado

Fundação do repositório frontend, **antes** de qualquer feature: (1) workflow assistido por IA
(Commands → Skills → Agentes) adaptado do backend Laravel canónico; (2) `system_spec` reestruturado em
hierarquia + `WORKFLOW.md` + `process-warnings.md`; (3) tooling de contrato backend-first
(`openapi-typescript` + `gen-models.mjs`) que gera `src/app/contrato/` a partir do `openapi.yaml` do
backend obtido por URL; (4) scaffold zoneless + `HttpClient` com interceptors; (5) instruções e convenções
do projeto (`CLAUDE.md`, `README.md`, `CHANGELOG.md`), incluindo grafia AO90.

## Ficheiros alterados (por área)

| Área | Tipo | Notas |
| --- | --- | --- |
| `.claude/**` (31) | criado/alterado | Commands + skills (workflow + `angular-best-practices` + `vitest-testing`) |
| `docs/system_spec/**`, `docs/WORKFLOW.md`, `docs/process-warnings.md` | criado/reestruturado | Hierarquia; specs antigas "flat" removidas |
| `scripts/gen-models.mjs`, `package.json`, `src/app/contrato/**`, `src/app/models/**`, `eslint.config.js` | criado/alterado | Tooling de contrato + tipos gerados + split contrato/models |
| `src/app/app.ts`, `.gitignore` | alterado | Scaffold zoneless/OnPush |
| `CLAUDE.md`, `README.md`, `CHANGELOG.md` | alterado | Instruções e docs de topo |

## Decisões tomadas

| Decisão | Alternativa considerada | Porquê esta |
| --- | --- | --- |
| `src/app/contrato/` (gerado) vs `src/app/models/` (à mão) | Tudo em `models/`; ou subpasta `backend/` | Nome honesto ("models" implicava criados aqui); gerador isolado não toca no que é à mão |
| Contrato obtido **por URL** (Valet / GitHub raw) | Ficheiro sibling `../…/openapi.yaml` | Não expõe a estrutura de pastas local no repo; portável em qualquer clone |
| **Grafia AO90** em todo o texto e identificadores | Grafia tradicional pré-AO90 | Norma em vigor; alinhado com o repo Laravel canónico |
| **NgRx permitido** (signals é o default) | Proibir NgRx | RxJS/operadores (`debounceTime`, `takeUntilDestroyed`) são úteis; interop `toSignal`/`toObservable` |
| `HttpClient` para leituras **e** mutações (sem `httpResource`) | `httpResource` para GET | `httpResource` é desenhado só para GET; uniformidade nas mutações |
| Template/estilos **sempre** em ficheiros separados | Inline em componentes pequenos | Preferência do projeto; legibilidade e diffs mais limpos |
| Remover rotas/features especulativas do spec | Mantê-las como "planeadas" | `system_spec` reflete só o que existe (não inventar) |
| `@Service` (v22) mantido | "Corrigir" para `@Injectable` | Confirmado via MCP `angular` — é API real (atalho de `@Injectable({providedIn:'root'})`) |

## Desvios ao Plano

**N/A — trabalho de bootstrap.** Não houve Plano prévio: este trabalho *criou* o próprio workflow, logo
não podia tê-lo seguido. Da próxima Issue em diante aplica-se o ciclo completo (Brief → Spec → Plano →
Código → Debrief → PR).

## Aprendizagens

- **Standalone + OnPush como defaults (v22):** escrevê-los explicitamente é redundante e desaconselhado
  pelo MCP `angular` — o objetivo mantém-se (tudo standalone + OnPush), garantido pelos defaults.
- **Signals ≠ `httpResource`:** adotar signals não obriga a `httpResource`; o estado reativo vive em signal
  stores alimentados por `HttpClient`, e `httpResource` seria só para leituras GET.
- **Zoneless:** a deteção depende de signals — mutações fora de signals podem não disparar CD; reforça a
  disciplina de estado só em signals/stores.
- **Lazy loading:** rotas de feature via `loadComponent()`; o ficheiro-índice `src/app/contrato/index.ts`
  dá um ponto de importação estável que sobrevive à regeneração do contrato.
- **MCP `angular` como fonte de verdade:** evitou uma "correção" errada — `@Service` é API real de v22.

## SYSTEM_SPEC atualizado

O `system_spec` **é** o entregável desta preparação (não há delta a documentar à parte). Índice
`00-index.md` coerente; convenções em `02-shared/` (nomenclatura + AO90, contrato, envelope, estados,
padrões); `03-models/`, `04-core/`, `05-routes/` alinhados.

## Verificação final
- [x] Linter a verde (`ng lint` — All files pass linting)
- [x] Tipos a verde (`tsc -p tsconfig.app.json --noEmit` — EXIT 0)
- [x] Nenhum dado sensível em logs / nenhum segredo em código
- [x] `src/app/contrato/` gerado e a compilar (guardião de exaustividade dos enums a verde)
