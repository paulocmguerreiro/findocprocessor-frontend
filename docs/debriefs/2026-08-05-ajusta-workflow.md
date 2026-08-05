# Debrief: Portar `/ajusta-workflow` do repo Laravel canónico

**Issue:** N/A — ajuste ad-hoc de workflow, fora do ciclo Brief → Spec → Plano (ver "Desvios ao Plano")
**Branch:** main
**Data:** 2026-08-05
**Commits:** 1 (`ebe8cc9`)

## O que foi implementado

O comando `/ajusta-workflow` existia no repo Laravel canónico mas nunca tinha transitado para este
repo — lacuna sinalizada por `WRN-001` em `docs/process-warnings.md` (falta de cobertura de testes
configurada, cuja sugestão nomeava `/ajusta-workflow` como o comando que a resolveria). Portou-se o
comando: classifica um ajuste de workflow/processo em Tipo A (comportamento de agente) / B
(conhecimento estrutural) / C (convenção de codificação) / D (misto) e aplica-o no ficheiro certo —
`.claude/commands/`, `.claude/skills/`, `docs/system_spec/` ou `CLAUDE.md` como último recurso.

A adaptação em relação à versão Laravel não foi cópia direta: grafia normalizada para AO90
(`correcto`→`correto`, `arquitecturais`→`arquiteturais`, `acção`→`ação`), o "mapa de destinos"
trocado para as pastas reais deste repo (`02-shared/padroes-signals.md`, `04-core/<concern>.md`,
`05-routes/`, em vez de Actions/DTOs/Repositories do Laravel), e os exemplos de uso trocados por
casos Angular (signal stores, cobertura de testes) em vez de PHP/Eloquent.

`docs/WORKFLOW.md` foi atualizado a par: a secção "Ajustar o processo (manual)" — que só descrevia a
heurística porque o comando ainda não existia aqui — passou a "Ajustar o processo — `/ajusta-workflow`",
com exemplo de uso, espelhando a secção equivalente do Laravel.

## Ficheiros alterados

| Ficheiro | Tipo de alteração | Notas |
| -------- | ----------------- | ----- |
| `.claude/commands/ajusta-workflow.md` | criado | Porta do Laravel; grafia AO90 + mapa de destinos + exemplos adaptados a Angular |
| `docs/WORKFLOW.md` | alterado | Secção "Ajustar o processo" passa de descrição manual a documentação do comando real; intro ganha a frase de leitura sequencial já existente no Laravel |

## Decisões tomadas

| Decisão | Alternativa considerada | Porquê esta |
| ------- | ----------------------- | ----------- |
| Não adicionar `/ajusta-workflow` à tabela "Comandos por fase" do `CLAUDE.md` | Listá-lo lá para visibilidade | Confirmado no Laravel: o comando é transversal (como `/mostra-workflow`), não uma fase da issue — o Laravel também não o lista nessa tabela; manter paridade |
| Debrief e revisão de spec produzidos sem Issue formal | Criar `/cria-issue` retroativa antes de documentar | Pedido explícito do utilizador para produzir "a documentação possível" já feita o commit; registar aqui a exceção em vez de forçar rastreabilidade artificial |
| Mapa de destinos do comando reescrito (não copiado do Laravel) | Manter tabela genérica igual à do Laravel, ajustando só nomes de pastas | Camadas divergem estruturalmente (Angular não tem Actions/DTOs/Repositories); copiar sem adaptar teria produzido um mapa incorreto para este repo |

## Desvios ao Plano

**Não houve Plano** — este trabalho não passou por `/cria-issue` → `/planeia-issue` →
`/implementa-plano`; foi um ajuste direto pedido em conversa, fora do ciclo SDD completo que o
`CLAUDE.md` normalmente exige. Consequência prática: os checkpoints A/B/task/② não se aplicaram; o
Checkpoint D (este documento) e a revisão de `system_spec` são feitos agora, retroativamente, a
pedido do utilizador, para não perder rastreabilidade totalmente.

## Aprendizagens

Este commit foi puramente de tooling de workflow (Markdown de comando + doc), sem código Angular —
não há aprendizagem de Standalone/Signals/OnPush/zoneless/lazy loading a registar. A seção mantém-se
por completude do template, não preenchida com "N/A" por regra do projeto: a única nota aplicável ao
domínio Angular é que a ausência de qualquer alteração em `src/app/**` é o motivo direto de não haver
aprendizagem de framework aqui.

## SYSTEM_SPEC a atualizar

Nenhum ficheiro em `docs/system_spec/`. A mudança é puramente de workflow/processo (Tipo A na própria
classificação do comando) — vive em `.claude/commands/` e `docs/WORKFLOW.md`, que `system_spec`
explicitamente não cobre (`system_spec` documenta a aplicação: features, models, core, rotas; não os
commands/skills do agente). Confirmado por revisão da `SYSTEM_SPEC_MAP` do `CLAUDE.md`: nenhuma linha
da tabela corresponde a "novo command de workflow".

## Verificação final
- [x] Nenhum código Angular alterado — `ng lint` / `ng build` / `ng test` não aplicáveis a este commit
- [x] Nenhum dado sensível em logs
- [x] Nenhum segredo em código
- [x] Grafia AO90 verificada por grep nos dois ficheiros alterados (sem `correcto`/`acção`/`arquitectural`/etc.)
