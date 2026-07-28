# Skill: atualiza-readme

Atualiza o `README.md` do repositório ativo com base no Debrief — apenas se a implementação expõe novas rotas, altera o stack, ou muda instruções de uso.

> **Categoria:** atualiza  
> **Usado em:** `/documenta-implementacao` (passo 5)  
> **Produz:** `README.md` atualizado (ou sem alterações se não aplicável)

## Contrato

**Input:**
- `docs/debriefs/YYYY-MM-DD-<slug>.md` — seções "O que foi implementado" e "Ficheiros alterados"
- `README.md` atual do repositório

**Output:** `README.md` atualizado (apenas seções afetadas)

**Usado em:** `/documenta-implementacao` (passo 5)

---

## Quando atualizar

Atualizar o README apenas quando a implementação introduz **pelo menos uma** das seguintes alterações:

| Situação | Seção a atualizar |
|---|---|
| Nova rota Angular (`/`, `/documents`, `/config`, …) | "Rotas" — adicionar à tabela |
| Nova feature completa | "Arquitetura" / "Rotas" |
| Alteração ao stack (nova dependência, ferramenta, versão) | "Stack" |
| Alteração ao comando de testes | "Testes" |
| Alteração ao processo de arranque (dev) | "Como correr (dev)" |
| Alteração ao processo de sincronização de contrato | "Sincronização de contrato" |
| Rota ou feature removida | "Rotas" — remover da tabela |

**Não atualizar** quando as alterações são puramente internas: refactors, novos testes, novos tipos internos, ajustes de estado sem impacto nas rotas ou no arranque.

---

## Regras

- Atualizar apenas as seções afetadas — nunca reescrever o ficheiro completo
- Manter o formato existente (tabelas Markdown, blocos de código)
- Se não houver alterações necessárias, registar "README sem alterações" e não criar commit
- Commit separado quando há alterações: `📝 docs: atualizar README após #N`
