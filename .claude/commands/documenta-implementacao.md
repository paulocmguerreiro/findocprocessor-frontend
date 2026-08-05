---
description: Fase 3a — Debrief + SYSTEM_SPEC + Changelog (artefactos locais)
allowed-tools: [Bash, Read, Write, Edit]
model: sonnet
effort: high
---

# /documenta-implementacao

**Fase 3a** — Documenta a implementação: Debrief → SYSTEM_SPEC → Changelog → README.
Produz apenas artefactos locais. Para criar o PR, usar `/publica-implementacao`.

## Argumentos
- `$ARGUMENTS`: número da issue (ex: `#5`) — opcional; se omitido, lê de `workflow-state.md`

## Pré-condições
1. Ler `docs/workflow-state.md` — confirmar `fase: documenta`
2. Testes a verde (`ng test --coverage --watch=false`) e `ng build --configuration=production` a verde — verificar antes de continuar

## Passos

1. Skill `escreve-debrief` → `docs/debriefs/YYYY-MM-DD-<slug>.md`
   > Seção **"Aprendizagens"** é obrigatória e prioritária — o que ficou mais claro sobre Standalone, Signals, OnPush, zoneless ou lazy loading após esta issue. Não omitir nem preencher com "N/A".
2. Skill `pausa-checkpoint` tipo=D — mostrar seção "Decisões tomadas" e aguardar confirmação
3. Skill `atualiza-spec` — atualizar `docs/system_spec/*.md` conforme `SYSTEM_SPEC_MAP` do `CLAUDE.md`.
   Esta é a **única** oportunidade de atualizar o system_spec (a Fase 2 não o faz — ver
   `escreve-plan.md`) — correr sempre a checklist de verificação da própria skill antes de avançar
   para o passo seguinte.
4. Skill `atualiza-changelog` — adicionar entrada em `CHANGELOG.md`
5. Skill `atualiza-readme` — atualizar `README.md` se afetado (novas rotas consumidas, stack, instruções)
5b. **Contrato da API — o frontend CONSOME, não autora.** Se a issue passou a consumir rotas/schemas/enums
   novos ou alterados da API, o contrato tem de existir **primeiro** no backend (`findocprocessor-backend-laravel/openapi.yaml`).
   Neste passo:
   - Correr skill `sincroniza-contrato` — regenera `src/app/contrato/api.generated.ts` a partir do `openapi.yaml`
     do backend e reporta o drift.
   - Atualizar `docs/system_spec/02-shared/contrato-api.md` com o delta consumido (rotas/schemas/enums novos).
   - Se o backend **ainda não** tem o contrato necessário → **parar** e sinalizar: a rota/model deve ser
     preparada primeiro no repo Laravel. O Angular nunca inventa contrato. (Ver `docs/system_spec/02-shared/contrato-api.md`.)
   - Se a issue não tocou na API, não há alterações.
6. Commitar todos os artefactos de documentação:
   ```bash
   git add docs/debriefs/ docs/system_spec/ CHANGELOG.md README.md src/app/contrato/
   git commit -m "docs(process): debrief + system_spec + changelog — Issue #N <slug>"
   ```
7. Atualizar `docs/workflow-state.md`:
   ```yaml
   fase: publica
   proximo_passo: /publica-implementacao #N
   debrief: docs/debriefs/YYYY-MM-DD-<slug>.md
   ```
8. Output final:
   ```
   ✅ Documentação concluída — Issue #N
   Debrief:     docs/debriefs/YYYY-MM-DD-<slug>.md
   SYSTEM_SPEC: atualizado
   Changelog:   atualizado
   README:      atualizado (ou sem alterações)
   Contrato:    sincronizado (ou sem alterações)
   Próximo:     /publica-implementacao #N
   ```
