# Debrief: Configurar cobertura de testes (Vitest) no target `test`

**Issue:** #8
**Branch:** chore/cobertura-testes
**Data:** 2026-08-05
**Commits:** 4

## O que foi implementado

Cobertura de testes configurada no target `test` do `angular.json`: devDependency
`@vitest/coverage-v8` instalada, opções do builder (`coverage`, `coverageInclude`,
`coverageExclude`, `coverageReporters`, `coverageThresholds`) preenchidas com base na cobertura real
medida sobre o único código com lógica hoje (`app.ts` + `SessaoAtivaStore`), e o gate de CI em
`CLAUDE.md` passa a exigir `ng test --coverage --watch=false`. `WRN-001` resolvido.

## Ficheiros alterados

| Ficheiro | Tipo de alteração | Notas |
| -------- | ----------------- | ----- |
| `package.json` / `package-lock.json` | alterado | devDependency `@vitest/coverage-v8` (`^4.1.10`) |
| `angular.json` | alterado | target `test`: `coverage: true`, `coverageInclude: ["src/app/app.ts", "src/app/state/**/*.ts"]`, `coverageExclude: ["src/app/contrato/**"]`, `coverageReporters: ["text"]`, `coverageThresholds` a 95% (statements/branches/functions/lines) |
| `CLAUDE.md` | alterado | secção "FERRAMENTAS DE QUALIDADE": comando e gate 3 passam a `ng test --coverage --watch=false` |
| `docs/process-warnings.md` / `docs/process-warnings-concluidos.md` | alterado (local, não versionado) | `WRN-001` movido para `RESOLVIDO` |

## Decisões tomadas

| Decisão | Alternativa considerada | Porquê esta |
| ------- | ----------------------- | ----------- |
| Motor `@vitest/coverage-v8` | `@vitest/coverage-istanbul` | `v8` é o motor nativo do runtime Vitest/Node, sem instrumentação adicional; sem histórico de necessidade de `branches` mais precisos que justifique o custo de `istanbul` (R2 do Brief) |
| `coverageInclude` restrito a `src/app/app.ts` + `src/app/state/**/*.ts`, não `src/app/**` | Incluir todo `src/app` desde já | O resto de `features/`, `core/`, `shared/`, `models/` são pastas só com `.gitkeep` — medir cobertura sobre ficheiros que não existem não produz sinal; alargar o `coverageInclude` é decisão de cada issue futura que crie código nessas pastas (RN-01) |
| `coverageThresholds` a 95% em todas as métricas | 100% (igual ao medido) | Baseline real é 100%, mas fixar o limiar exatamente no valor medido rebentaria o gate com qualquer linha nova não coberta, mesmo pontual; 95% dá margem sem esvaziar o propósito do gate |
| `coverageReporters: ["text"]` | `["text", "html", "lcov"]` | Suficiente para visibilidade em terminal/CI local; não há consumidor (badge, upload) para relatórios `html`/`lcov` nesta issue — acrescentar reporters é trivial quando/se surgir esse consumidor |
| `CLAUDE.md` (gate de CI) atualizado; `TEST_RUNNER` (`STACK_CONFIG`) mantido em `ng test --watch=false` | Atualizar também o `TEST_RUNNER` | CA-07 tinha âmbito explícito na secção "FERRAMENTAS DE QUALIDADE"; **descoberto durante a implementação** que a distinção é parcialmente cosmética — `coverage: true` no `angular.json` é opção estática do builder, por isso qualquer invocação de `ng test` (com ou sem `--coverage` no CLI) já mede cobertura. Mantém-se `TEST_RUNNER` textualmente inalterado porque continua a ser o comando do dia a dia (Fase 2, `executa-testes`), mas não é "sem overhead de cobertura" como a Spec assumia |

## Desvios ao Plano

- **Tarefa 4 não gerou commit.** `docs/process-warnings.md` e `docs/process-warnings-concluidos.md`
  estão em `.gitignore` (ficheiros locais, alinhados com o repo Laravel canónico) — a resolução do
  `WRN-001` não tem nada para o git seguir. O commit `chore(testing): resolver WRN-001` previsto no
  Plano não se aplica.
- **`docs/process-warnings-concluidos.md` criado nesta issue** — não existia antes; é o primeiro aviso
  a ser arquivado desde que a skill `regista-aviso` define esse ficheiro.

## Aprendizagens

**`coverage: true` no builder não é "opt-in por invocação" — é um default do target.** A expectativa
inicial (Brief/Spec) era que `ng test --watch=false` (sem `--coverage`) continuasse "rápido, sem
cobertura" e só o gate de CI explícito (`--coverage --watch=false`) a exercesse. Na prática,
`coverage: true` em `angular.json` aplica-se a qualquer execução do target `test`, com ou sem a flag
CLI — confirmado correndo os dois comandos e obtendo o mesmo relatório em ambos. Isto é coerente com
o resto do `angular.json`: opções do builder são a configuração do target, a flag CLI é só um atalho
para ligar/desligar quando não há config. Não há "modo leve" separado a não ser removendo `coverage`
do `angular.json` outra vez.

**Cobertura sobre um componente com template externo mede o `.ts` e o `.html` como entradas
distintas.** Com `coverageInclude` a apontar só para ficheiros `.ts`, `src/app/app.html` desapareceu
do relatório (19 statements → 15) apesar de continuar a ser o template real do `app.ts` incluído. O
`coverage-final.json` do provider `v8` trata cada ficheiro fonte transformado como entrada própria —
manter o template "SEMPRE em ficheiro à parte" (convenção do projeto) não isenta esse ficheiro de ser
medido; só muda que passa a precisar de constar explicitamente do `coverageInclude` se se quiser
contabilizá-lo.

**Um limiar calibrado sobre 100% real ainda precisa de margem, não do valor exato.** Com só dois
ficheiros de lógica no repositório, a tentação óbvia era fixar `coverageThresholds` em 100 — mas isso
tornaria qualquer linha nova não testada, por mais trivial, um build a falhar de imediato em vez de um
sinal de atenção. 95% preserva o gate como intenção (cobertura não pode degradar silenciosamente) sem
o tornar frágil a variações mínimas.

## SYSTEM_SPEC a atualizar

- `docs/system_spec/07-testing.md` — secção nova "Cobertura": motor (`v8`), `coverageInclude`
  restrito ao que já tem `*.spec.ts`, exclusão de `src/app/contrato/**`, limiares (95%, com nota de
  que são recalibrados à medida que mais código ganha testes), e a descoberta de que `coverage: true`
  é default do target (não distintivo por flag CLI).
- `docs/system_spec/06-config.md` — secção nova "Cobertura", espelhando as opções reais do target
  `test` em `angular.json`, por paridade de configuração (regra já existente no ficheiro para
  `package.json`/`angular.json`/`environments`).

## Verificação final

- [x] Linter a verde — `ng lint`
- [x] Testes a verde — `ng test --coverage --watch=false` (8 testes, 100% cobertura, limiares 95% cumpridos)
- [x] Build de produção a verde — `ng build --configuration=production`
- [x] Nenhum dado sensível em logs
- [x] Nenhum segredo em código
