# Plano: Configurar cobertura de testes (Vitest) no target `test`

**Issue:** #8
**Spec:** docs/specs/2026-08-05-cobertura-testes.md
**Data:** 2026-08-05

## Tarefas

### Tarefa 1 — Instalar devDependency de cobertura

- Ficheiros a criar/alterar: `package.json`, `package-lock.json`
- O que implementar: `npm install -D @vitest/coverage-v8` (RNF-01).
- Testes associados: nenhum (dependência de build).
- Commit: `chore(testing): instalar @vitest/coverage-v8`

### Tarefa 2 — Medir baseline real e configurar `angular.json`

- Ficheiros a criar/alterar: `angular.json`
- O que implementar:
  - Correr `ng test --coverage --watch=false` sem `coverageInclude`/`exclude` para obter os números
    reais atuais de `src/app/app.ts` e `src/app/state/sessao-ativa.store.ts`.
  - Configurar o target `test`: `coverage: true`, `coverageInclude: ["src/app/app.ts", "src/app/state/**/*.ts"]`
    (exclui `*.spec.ts` automaticamente pelo builder), `coverageExclude: ["src/app/contrato/**"]`,
    `coverageReporters: ["text"]`, `coverageThresholds` com os valores medidos menos uma margem
    pequena (RN-03).
- Testes associados: nenhum (config).
- Commit: `chore(testing): configurar cobertura no target test`

### Tarefa 3 — Atualizar CLAUDE.md (gate de CI)

- Ficheiros a criar/alterar: `CLAUDE.md`
- O que implementar: secção "FERRAMENTAS DE QUALIDADE" — trocar `ng test --watch=false` por
  `ng test --coverage --watch=false` no bloco de comandos e na lista de CI gates (CA-07).
- Testes associados: nenhum.
- Commit: `chore(testing): exigir cobertura no gate de CI (CLAUDE.md)`

### Tarefa 4 — Verificar gate completo e resolver WRN-001

- Ficheiros a criar/alterar: `docs/process-warnings.md`, `docs/process-warnings-concluidos.md`
- O que implementar:
  - Correr `ng lint` + `ng build --configuration=production` + `ng test --coverage --watch=false` —
    confirmar os três a verde (CA-04).
  - Marcar `WRN-001` como `STATUS: RESOLVIDO | <timestamp>` e mover o bloco para
    `docs/process-warnings-concluidos.md` (CA-08).
- Testes associados: nenhum.
- Commit: `chore(testing): resolver WRN-001 — cobertura configurada`

## Ordem de implementação

1. Tarefa 1 — a devDependency é pré-requisito de qualquer opção `coverage` funcionar.
2. Tarefa 2 — depende da Tarefa 1 (senão `ng test --coverage` continua a falhar).
3. Tarefa 3 — depende da Tarefa 2 (só documentar o gate depois de ele passar de facto).
4. Tarefa 4 — depende de 1-3; é a verificação final + fecho do warning.

## Testes a escrever

| Teste | Tipo | Ficheiro | Verifica |
| ----- | ---- | -------- | -------- |
| — | — | — | Nenhum teste novo — esta issue mede a suite existente, não escreve testes (fora de âmbito, ver Brief) |

## Dependências

- Issues bloqueantes: nenhuma.
- Deve ser implementada após: #5 (fechada — fonte da baseline real de cobertura).

## Riscos de implementação

> Consolidados do Brief e da Spec.

- R1 (Brief) — `coverageInclude` restrito a `app.ts` + `state/**`, não `src/app/**` inteiro, para não
  gerar limiares artificialmente altos sobre pastas ainda vazias (`.gitkeep`).
- R2 (Brief) — `@vitest/coverage-v8`, não `istanbul`.

## O que NÃO fazer nesta issue

- Não escrever testes novos.
- Não alterar `SessaoAtivaStore` nem `app.ts`.
- Não atualizar `docs/system_spec/07-testing.md` nem `06-config.md` — fica para
  `/documenta-implementacao` (Fase 3a, skill `atualiza-spec`), informado pelo Debrief.
- Não configurar upload de relatório de cobertura para serviço externo (badges, Codecov, etc.).
