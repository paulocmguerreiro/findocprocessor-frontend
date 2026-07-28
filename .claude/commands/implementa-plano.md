---
description: Fase 2 — Implementação tarefa a tarefa com checkpoint e testes
allowed-tools: [Bash, Read, Write, Edit]
effort: high
---

# /implementa-plano

**Fase 2** — Implementa o Plano tarefa a tarefa, com checkpoint por tarefa e testes no final.

## Argumentos

- `$ARGUMENTS`: número da issue (ex: `#5`) — opcional; se omitido, lê de `workflow-state.md`

## Pré-condições

1. Ler `docs/workflow-state.md` — confirmar `fase: implementa`
2. Ler `docs/plans/YYYY-MM-DD-<slug>.md` — lista de tarefas
3. Verificar branch ativa: `git branch --show-current`
4. Se pré-condição falhar → skill `regista-aviso` e avisar utilizador

## Loop por cada tarefa do Plano

### Anunciar

```
▶ Tarefa N/T: <título>
```

### Pesquisar antes de implementar

**MCP `angular`** — antes de escrever qualquer código, consultar a documentação e boas práticas relevantes para esta tarefa:

- `get_best_practices` — carregar os standards atuais da versão de Angular instalada (Standalone, Signals, OnPush, zoneless). **Obrigatório** antes de gerar/alterar código.
- `search_documentation` — 1-2 queries focadas no conceito concreto a implementar (ex: `signal inputs`, `HttpClient`, `control flow @if @for`, `signal forms`).
- Se a tarefa consome uma rota/model/enum da API → confirmar contra `src/app/contrato/api.generated.ts` (fonte gerada do contrato). **Nunca** inventar campos/rotas: o contrato é preparado primeiro no backend (ver `docs/system_spec/02-shared/contrato-api.md`).
- Usar os resultados para confirmar a API correta antes de escrever — não assumir com base em treino.

### Triagem semântica — antes de implementar

Skill `executa-triagem-semantica` alvo=tarefa-planeada — lê os specs relevantes para o(s) tipo(s) de
ficheiro que esta tarefa vai criar/alterar (component, service, store, model, interceptor, token, teste),
antes de escrever código. Sem correção, só contexto.

### Implementar

Implementar apenas o código desta tarefa. Não antecipar tarefas seguintes.

### Lint (antes de commitar)

Antes de cada checkpoint, executar:

```bash
ng lint --fix    # ESLint + @angular-eslint — formatação e correções automáticas
```

Se houver alterações, incluí-las nos ficheiros do checkpoint. Não commitar código sem passar pelo ESLint.

### Definition of Done — paridade de configuração

Se a tarefa alterou **`package.json`**, **`angular.json`** ou **`src/environments/*`**:
→ atualizar a configuração dependente em conformidade (scripts, build targets, tokens de ambiente) e
incluir essas alterações no **mesmo** checkpoint. Não deixar a configuração desatualizada face ao código.
Detalhe: `docs/system_spec/06-config.md`.

### Triagem semântica — antes do checkpoint

Skill `executa-triagem-semantica` alvo=codigo — o ESLint não deteta nomes semanticamente incorretos,
duplicação de blocos, nem violações de convenção (Standalone/OnPush, SSE só no `SseStore`, sem
`localStorage`/`sessionStorage`, sem `any`). Relê os ficheiros alterados nesta tarefa contra os specs
relevantes (dinamicamente, conforme o tipo de ficheiro) e corrige antes do checkpoint — não deixar para
revisão do utilizador.

### Checkpoint por tarefa

Skill `pausa-checkpoint` tipo=task — mostrar ficheiros alterados e aguardar resposta:

```
✋ Checkpoint — Tarefa N implementada

Ficheiros alterados:
- <lista>

Specs lidos nesta tarefa: <lista de docs/system_spec/ lidos na triagem>

Leste o código? Responde:
  [s]       → commit e avançar
  [explica] → explicar decisões antes de commitar
  [altera]  → descrever o que alterar
```

### Propor commit

Skill `propoe-commit` — proposta formatada, aguarda confirmação antes de executar.

## Após todas as tarefas

1. Skill `executa-testes` — `ng test --watch=false` (Vitest); auto-retry até 3x; se persistir → skill `regista-aviso`
2. **Gate lint + build** — `ng lint` **e** `ng build --configuration=production` têm de passar (paridade com o CI). Se falhar → pausar e reportar; não avançar.
3. Skill `pausa-checkpoint` tipo=② — resumo de implementação + confirmação antes de avançar
4. Atualizar `docs/workflow-state.md`:
    ```yaml
    fase: documenta
    proximo_passo: /documenta-implementacao #N
    ```
5. Output final:
    ```
    ✅ Fase 2 concluída — Issue #N
    Tarefas: N/N  |  Testes: ✅  |  Lint+Build: ✅
    Próximo: /documenta-implementacao #N
    ```
