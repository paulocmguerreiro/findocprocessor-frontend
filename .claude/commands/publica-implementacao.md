---
description: Fase 3b — PR no GitHub a partir do Debrief
allowed-tools: [Bash, Read]
model: sonnet
effort: medium
---

# /publica-implementacao

**Fase 3b** — Publica a implementação no GitHub: gera o PR body, aguarda revisão e cria o PR.
Requer `/documenta-implementacao` completo antes de executar.

## Argumentos
- `$ARGUMENTS`: número da issue (ex: `#5`) — opcional; se omitido, lê de `workflow-state.md`

## Pré-condições
1. Ler `docs/workflow-state.md` — confirmar `fase: publica`
2. Confirmar que `docs/debriefs/` tem o debrief desta issue
3. Verificar se PR já existe para evitar duplicado:
   ```bash
   gh pr list --repo $GITHUB_REPO --head <branch> --json number,url,state
   ```
   Se existir → mostrar URL e parar.
4. **Gate de paridade CI (local, falha fecha):**
   ```bash
   ng lint
   ng build --configuration=production
   ng test --watch=false
   ```
   Corre a mesma sequência que o CI executa no primeiro push. Se qualquer passo falhar →
   **parar, NÃO publicar** e reportar o erro. Detalhe dos gates: `CLAUDE.md` → "FERRAMENTAS DE QUALIDADE".

## Passos

1. Gerar PR body a partir do Debrief:
   ```markdown
   ## O que muda
   [resumo das alterações]

   ## Decisões técnicas
   [lista das decisões do Debrief]

   ## Testes
   - [ ] Vitest (`ng test --watch=false`) a verde
   - [ ] Linter (`ng lint`) a verde
   - [ ] Build de produção (`ng build --configuration=production`) a verde

   ## Verificação RGPD/NIS2
   - Dados pessoais: [sim/não — detalhe]
   - Superfície de ataque: [alterada/inalterada]

   Closes #N
   ```
2. Skill `pausa-checkpoint` tipo=E — mostrar PR body completo e aguardar confirmação:
   ```
   📋 Checkpoint E — Revisão do PR
   [PR body]
   Confirmas que consegues defender cada decisão listada?
   ```
3. Skill `propoe-pr` → criar PR no GitHub
4. Recuperação se `gh pr create` falhar → skill `regista-aviso` (WRN-NNN) + manter `workflow-state.md`
5. Remover `docs/workflow-state.md` após PR criado com sucesso
6. Output final:
   ```
   ✅ PR criado — Issue #N
   PR: <URL>
   workflow-state removido. Issue encerra quando PR for merged.
   ```
