# Spec: Configurar cobertura de testes (Vitest) no target `test`

**Issue:** #8
**Brief:** docs/briefs/2026-08-05-cobertura-testes.md
**Data:** 2026-08-05

## Requisitos funcionais

- RF-01: `ng test --coverage --watch=false` corre sem erro e produz um relatório de cobertura no
  terminal.
- RF-02: o relatório de cobertura inclui apenas ficheiros com lógica de aplicação — exclui
  `src/app/contrato/**` (gerado) e ficheiros sem lógica (`main.ts`, `*.routes.ts` vazios,
  `*.config.ts`).
- RF-03: o build falha (exit code ≠ 0) se a cobertura medida cair abaixo dos limiares configurados.

## Requisitos não funcionais

- RNF-01: motor de cobertura `v8` (nativo do Vitest/Node) — sem dependência de instrumentação
  adicional (istanbul).
- RNF-02: `coverageReporters` inclui pelo menos `text` (visível em terminal/CI local, sem passo extra
  de upload).

## Contratos de API

Não aplicável — não consome nem altera nenhuma rota/schema do backend.

## Modelo de dados

Não aplicável.

## Regras de negócio

- RN-01: `coverageInclude` fica restrito aos ficheiros que já têm `*.spec.ts` associado
  (`src/app/app.ts`, `src/app/state/sessao-ativa.store.ts`) — não `src/app/**` inteiro. Alargar o
  âmbito é decisão de uma issue futura, quando uma feature nova justificar medir a sua própria
  cobertura (ver R1 do Brief).
- RN-02: `coverageExclude` cobre, no mínimo, `src/app/contrato/**` (gerado — já ignorado no ESLint,
  ver `06-config.md`).
- RN-03: `coverageThresholds` são calculados a partir da cobertura real medida sobre o `coverageInclude`
  definido em RN-01 (não um número redondo arbitrário) — com margem de poucos pontos percentuais
  abaixo do valor medido, para não rebentar o gate com qualquer variação mínima entre execuções.

## Dependências

- Issues bloqueantes: nenhuma (#5, referida como baseline de conteúdo, já está fechada).

## Questões resolvidas

| Questão (do Brief) | Decisão |
| ------------------- | ------- |
| R1 — âmbito do `coverageInclude` | Restrito aos ficheiros já testados (RN-01), não `src/app` inteiro |
| R2 — motor de cobertura | `@vitest/coverage-v8` (RNF-01) |

## Critérios de aceitação

> Herdados da issue #8 — nunca remover ou reformular sem justificação.

- [ ] CA-01: devDependency `@vitest/coverage-v8` instalada. _(issue)_
- [ ] CA-02: target `test` do `angular.json` configurado com `coverage: true`, `coverageInclude`,
      `coverageExclude` (mínimo `src/app/contrato/**`) e `coverageReporters`. _(issue)_
- [ ] CA-03: `coverageThresholds` definidos com base na cobertura real medida no código existente
      (`SessaoAtivaStore` + `app.ts`) como referência. _(issue)_
- [ ] CA-04: `ng test --coverage --watch=false` corre sem erro e reporta cobertura. _(issue)_
- [ ] CA-05: `docs/system_spec/07-testing.md` documenta a política de cobertura. _(issue — executado em
      Fase 3a via `atualiza-spec`, não nesta Fase 2)_
- [ ] CA-06: `docs/system_spec/06-config.md` documenta as opções de cobertura do target `test`.
      _(issue — executado em Fase 3a via `atualiza-spec`, não nesta Fase 2)_
- [ ] CA-07: `CLAUDE.md`, secção "FERRAMENTAS DE QUALIDADE", lista `ng test --coverage --watch=false`
      nos gates de CI. _(issue)_
- [ ] CA-08: `WRN-001` marcado `STATUS: RESOLVIDO` e movido para `docs/process-warnings-concluidos.md`.
      _(issue)_
- [ ] CA-09: `coverageInclude` restrito conforme RN-01 (não `src/app/**` inteiro). _(spec)_

## SYSTEM_SPEC a atualizar

- `docs/system_spec/07-testing.md` — secção nova "Cobertura" (política, exclusões, limiares).
- `docs/system_spec/06-config.md` — secção nova "Cobertura" (paridade de configuração do target `test`).

> Ambos ficam marcados no Debrief (Fase 2 → Fase 3a) — não escritos nesta fase, por regra de
> `escreve-plan`.

## Verificação RGPD/NIS2

- Dados pessoais: não.
- Superfície de ataque: inalterada — configuração de build/test, não corre em produção.
