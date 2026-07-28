# Process Warnings

Registo de erros de processo com ID sequencial. Verificar no início de cada sessão.

---

## PW-001 — Nunca sincronizar `.claude/` por symlink a partir do repo de workflow

**Nunca** usar, correr ou recriar o processo `findocprocessor-workflow/scripts/sync-references.py`
(o que criava symlinks de `.claude/commands` e `.claude/skills` a partir do repo de workflow
**deprecado** para cada repo de stack, disparado por um hook `PostToolUse`).

**Porquê:** rebentou e apagou ficheiros do utilizador.

**Como agir:** este repo tem os seus **próprios ficheiros reais** em `.claude/commands` e `.claude/skills`
(copiados e adaptados do repo canónico Laravel — ver `docs/WORKFLOW.md`), **nunca** symlinks para
`findocprocessor-workflow`. Se aparecerem symlinks a apontar para o repo de workflow, propor
substituí-los por ficheiros reais e **confirmar antes de remover** o que quer que seja. Nunca ligar um
hook que altere `.claude/` entre repos.
