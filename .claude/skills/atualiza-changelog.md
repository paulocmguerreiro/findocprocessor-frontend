# Skill: atualiza-changelog

Adiciona uma entrada ao `CHANGELOG.md` no formato Keep a Changelog.

> **Categoria:** atualiza  
> **Usado em:** `/documenta-implementacao` (passo 4)  
> **Produz:** `CHANGELOG.md` atualizado

## Contrato

**Input:**
- `docs/debriefs/YYYY-MM-DD-<slug>.md` — seção "O que foi implementado"
- Número da issue (`#N`)
- Tipo de alteração: Added | Changed | Fixed | Removed | Security

**Output:** `CHANGELOG.md` atualizado

**Usado em:** `/documenta-implementacao` (passo 4)

---

## Formato

```markdown
## [Unreleased]

### Added
- <descrição da nova funcionalidade> (#N)

### Changed
- <descrição de alteração de comportamento> (#N)

### Fixed
- <descrição de correção de bug> (#N)
```

---

## Regras
- Adicionar sempre na seção `[Unreleased]` — nunca criar nova versão manualmente
- Uma linha por alteração significativa — não listar ficheiros individuais
- Referenciar sempre o número da issue `(#N)`
- Commit separado: `📝 docs: atualizar changelog após #N`
