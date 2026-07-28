# Skill: pausa-checkpoint

Pausa o fluxo, apresenta o contexto relevante e aguarda uma resposta com conteúdo do utilizador.
**Nunca aceitar "sim" como resposta suficiente** — exigir resposta que demonstre compreensão.

> **Categoria:** pausa  
> **Usado em:** todos os commands  
> **Produz:** resposta interativa do utilizador (confirma, corrige ou responde)

## Contrato

**Input:**

- `tipo`: A | B | task | ② | D | E
- `contexto`: conteúdo a mostrar (gerado pelo command chamador)

**Output:** resposta do utilizador (string com conteúdo)

**Usado em:** todos os commands

---

## Comportamento por tipo

### Checkpoint A — Após Brief

```
🔵 Checkpoint A — Compreensão da issue

[Brief gerado]

Responde com as tuas palavras:
1. O que muda exatamente no domínio com esta issue?
2. Que risco identificas nesta implementação?
3. Que componente/camada é mais afetado?

Questões em aberto do Brief (resolve antes de avançar para a Spec):
[lista de ## Questões em aberto do Brief, ou "nenhuma"]
```

Aguardar resposta com conteúdo. **Não avançar para `escreve-spec` enquanto houver questões em aberto sem resposta.**

---

### Checkpoint B — Após Spec

```
🔵 Checkpoint B — Verificação de arquitetura

Verifiquei a Spec contra a seção ARQUITETURA do CLAUDE.md:

Padrões obrigatórios respeitados:
- [lista]

Desvios detetados:
- [lista ou "nenhum"]

"O que NÃO fazer" potencialmente violado:
- [lista ou "nenhum"]

Confirmas a Spec? [sim — sem reservas | corrige — descreve o que alterar]
```

---

### Checkpoint task — Após cada tarefa

```
✋ Checkpoint — Tarefa N/T implementada

Ficheiros alterados:
- <lista com paths relativos>

Leste o código? Responde:
  [s]       → commitar e avançar para tarefa seguinte
  [explica] → explicar as decisões desta tarefa antes de commitar
  [altera]  → descrever o que devo alterar
```

Se `explica` → explicar. Se `altera` → alterar e repetir checkpoint desta tarefa.

---

### Checkpoint ② — Após todas as tarefas

```
✅ Checkpoint ② — Implementação completa

Issue:   #N
Tarefas: N/N completadas
Testes:  ✅ passaram (ou ⚠️ com detalhe)
Gate:    ✅ lint + build a verde | ⚠️ com detalhe

Resumo por ficheiro:
- <ficheiro>: [o que foi alterado]

Posso avançar para a documentação? [s | preciso de rever <tarefa>]
```

---

### Checkpoint D — Após Debrief

```
📋 Checkpoint D — Revisão do Debrief

Decisões tomadas nesta issue:
[tabela "Decisões tomadas" extraída do Debrief]

Confirmas estas decisões?
Responde com o porquê de cada uma — em especial as que não eram óbvias.
```

Aguardar resposta com conteúdo antes de atualizar SYSTEM_SPEC.

---

### Checkpoint E — Antes do PR

```
📋 Checkpoint E — Revisão do PR

[PR body completo]

Confirmas que consegues defender cada decisão apresentada?
```

Aguardar confirmação antes de invocar `propoe-pr`.
