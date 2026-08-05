# Brief: Configurar cobertura de testes (Vitest) no target `test`

**Issue:** #8
**Data:** 2026-08-05
**Branch:** chore/cobertura-testes

## Contexto

O target `test` do `angular.json` (`builder: @angular/build:unit-test`) não declara nenhuma das
opções de cobertura do schema do builder — confirmado localmente em
`node_modules/@angular/build/src/builders/unit-test/schema.json` (`coverage`, `coverageInclude`,
`coverageExclude`, `coverageReporters`, `coverageThresholds`, `coverageWatermarks`) e replicado no
CLI (`npx ng test --help`). `ng test --coverage --watch=false` falha de imediato por faltar a
devDependency `@vitest/coverage-v8` (ou `@vitest/coverage-istanbul`). Isto foi registado como
`WRN-001` em `docs/process-warnings.md`, com a nota explícita de que definir limiares antes de
existir código real testado dava números arbitrários.

Essa condição já não se verifica: a issue #5 (`SessaoAtivaStore`, mesclada) deixou o primeiro código
com testes a sério do projeto (`src/app/state/sessao-ativa.store.spec.ts`), que serve agora de
baseline real para os limiares.

## O que muda

- **`package.json`** — devDependency `@vitest/coverage-v8` (motor de cobertura nativo do Vitest,
  sem necessidade de instrumentação adicional).
- **`angular.json`**, target `test` — `coverage: true`, `coverageInclude`/`coverageExclude` (exclui
  no mínimo `src/app/contrato/**`, gerado e já ignorado no ESLint), `coverageReporters` (`text` para
  o terminal/CI), `coverageThresholds` calibrados na cobertura real medida sobre `app.ts` +
  `SessaoAtivaStore` (únicos ficheiros com lógica hoje — o resto de `features/`, `core/`, `shared/`
  são pastas só com `.gitkeep`).
- **`CLAUDE.md`**, secção "FERRAMENTAS DE QUALIDADE" — gate de CI passa a `ng test --coverage --watch=false`.
- **`docs/process-warnings.md`** — `WRN-001` marcado `STATUS: RESOLVIDO` e movido para
  `docs/process-warnings-concluidos.md`.
- **`docs/system_spec/07-testing.md` e `06-config.md`** — não são tocados nesta fase (Fase 2); ficam
  para `/documenta-implementacao` → skill `atualiza-spec`, informada pelo Debrief (regra do Plano:
  nunca antecipar documentação de system_spec na Fase 2).

## O que NÃO muda

- Nenhum código de domínio — não cria nem altera componentes, stores, services.
- Nenhum teste novo — usa a suite existente (`app.spec.ts`, `sessao-ativa.store.spec.ts`) como
  baseline de medição.
- Nenhuma integração de CI externa (badges, upload de relatório para serviço terceiro).
- `src/app/contrato/` não é tocado (gerado).

## Riscos identificados

**R1 — Limiares demasiado apertados travam PRs futuros sem código morto.** Como só existem dois
ficheiros com lógica real, um limiar global (`lines`/`statements`) calculado sobre 100% de cobertura
desses dois ficheiros ficaria artificialmente alto para features ainda por construir. Mitigação:
limiares aplicados só ao que hoje tem testes (via `coverageInclude` restrito, não a `src/app` inteira)
até a próxima feature justificar alargar o âmbito — decisão a confirmar no Checkpoint A.

**R2 — `coverage-v8` vs `coverage-istanbul`.** V8 é o motor nativo do runtime Node/Vitest, mais rápido
e sem necessidade de transformação de código; istanbul dá `branches` mais precisos em alguns casos
mas exige instrumentação extra. Para um projeto pequeno e sem histórico de falsos negativos em
`branches`, `v8` é a escolha por omissão do Vitest e não há motivo para desviar.

## Questões em aberto

Nenhuma — as duas decisões técnicas (R1, R2) ficam resolvidas no Checkpoint A.
