# Skill: atualiza-spec

Atualiza os ficheiros `docs/system_spec/` com base no Debrief e no `SYSTEM_SPEC_MAP` do `CLAUDE.md`.

> **Categoria:** atualiza
> **Usado em:** `/documenta-implementacao` (passo 3)
> **Produz:** ficheiros `docs/system_spec/*.md` atualizados

## Contrato

**Input:**
- `docs/debriefs/YYYY-MM-DD-<slug>.md` — seção "SYSTEM_SPEC a atualizar"
- `SYSTEM_SPEC_MAP` do `CLAUDE.md` do repo ativo — **única fonte** de "que tipo de alteração vai para
  que ficheiro"; esta skill não mantém cópia própria do mapa (ver "Fonte da verdade" abaixo)

**Output:** ficheiros `docs/system_spec/*.md` atualizados

**Usado em:** `/documenta-implementacao` (passo 3)

---

## Fonte da verdade — sem cópia do mapa aqui

O mapa "tipo de alteração → ficheiro a atualizar" vive **exclusivamente** em `SYSTEM_SPEC_MAP` no
`CLAUDE.md` deste repo. Ler sempre
essa tabela antes de decidir o ficheiro a atualizar. Manter uma segunda cópia do mapa aqui foi a
causa de, no passado (no backend), um enum feature-specific ter ficado num ficheiro `02-shared/` em
vez de `01-features/<slug>.md` — a cópia da skill não foi atualizada com a mesma disciplina que o
`CLAUDE.md`. Se o repo ativo não tiver `SYSTEM_SPEC_MAP` no `CLAUDE.md`, perguntar ao utilizador
antes de assumir uma localização.

**Descoberta:** ler `docs/system_spec/00-index.md` primeiro — lista todas as features, models, ficheiros
de core e rotas existentes. Depois abrir apenas o ficheiro relevante.

---

## Regras de sustentabilidade (transversais a qualquer stack)

- Nova feature → criar `01-features/<slug>.md` (nunca acrescentar ao ficheiro de outra feature)
- `02-shared/` → **apenas** o que é verdadeiramente partilhado (`src/app/shared/`, convenções,
  envelope, estados); um enum, tipo ou regra de uma feature específica vai para `01-features/<slug>.md`
  **mesmo que pareça genérico**
- `04-core/` → um ficheiro por subsistema (services ≠ interceptors ≠ tokens ≠ SSE)
- **Obrigatório — ficheiro novo → atualizar `00-index.md`** no mesmo commit. Um ficheiro não
  registado no índice é invisível para a descoberta.

---

## Convenções de escrita (evitar desatualização e ruído)

- **Sem decoração de issue/PR solta** no corpo do texto (`(#94)`, "Issue #57" a meio de uma frase) —
  isso é o papel do `CHANGELOG.md` e do `git log`, não da system_spec. Manter o "porquê" de uma
  decisão não-óbvia quando ajuda a entender o desenho atual, mas sem o número da issue agarrado.
  Ex: preferir *"`restrictOnDelete()` — anteriormente `nullOnDelete`, decisão revertida por X"* a
  *"`restrictOnDelete()` (Issue #68)"*.
- **Não reproduzir blocos de código completos** que dupliquem o ficheiro fonte (corpo de um enum,
  interface, esqueleto de um componente/store) — descrever a semântica/valores em prosa ou tabela e
  apontar para o ficheiro (`ver src/app/contrato/api.generated.ts` para tipos do contrato, ou o ficheiro
  fonte). Um bloco de código no spec e o ficheiro real podem divergir silenciosamente; o ficheiro é
  sempre a fonte da verdade. **Os tipos do contrato são gerados** — nunca copiar o corpo de uma
  interface gerada para o spec.
  **Exceção — ficheiros de padrão** (o código É o produto, um template a copiar em código novo, não
  a documentação de uma instância já existente): `02-shared/padroes-componentes.md`,
  `02-shared/padroes-signals.md`, e a seção "máquina de estados" de `02-shared/estados.md`. O critério
  é **funcional** (o ficheiro/seção existe para ser copiado), não o nome do ficheiro — se um novo
  ficheiro de padrão for criado sem o prefixo `padroes-`, acrescentá-lo a esta lista explicitamente.
- Atualizar apenas as seções afetadas — não reescrever o ficheiro completo.
- Cada atualização é um commit separado: `📝 docs: atualizar system_spec após #N`.
- A system_spec regista o que **existe**, não o que está planeado nem o histórico de como lá chegou.

---

## Verificação obrigatória antes de terminar (checklist anti-esquecimento)

Antes de reportar esta skill como concluída, confirmar explicitamente — um a um, não por amostragem:

1. **Cobertura da seção "SYSTEM_SPEC a atualizar" do Debrief** — para cada ficheiro ali listado,
   confirmar que foi de facto aberto e alterado (ou justificar por que não precisou de alteração).
   Não avançar com ficheiros por abrir.
2. **`git diff` desta issue vs. `SYSTEM_SPEC_MAP`** — percorrer o `git diff <branch-base>...HEAD` (ou
   `git log` da branch) e confrontar cada tipo de alteração (novo componente/feature, novo signal store,
   novo service/interceptor/token, novo enum ou tipo, nova rota, nova config, etc.) com a tabela
   `SYSTEM_SPEC_MAP` do `CLAUDE.md`; qualquer tipo de alteração
   sem o ficheiro `docs/system_spec/` correspondente tocado é um esquecimento a corrigir antes de
   terminar — não confiar apenas na lista do Debrief, que pode estar incompleta.
3. **`00-index.md`** — se esta issue criou **qualquer** ficheiro novo em `docs/system_spec/` (feature,
   model, core, enum partilhado, rota), confirmar que `00-index.md` tem uma linha nova na tabela
   correta. Esta verificação é obrigatória mesmo que o Debrief não a mencione explicitamente.
4. **Tamanho dos ficheiros tocados** — para cada ficheiro `docs/system_spec/*.md` editado ou criado
   nesta passagem, contar as linhas (`wc -l`). Se ultrapassar **~200 linhas**, reportar uma nota
   informativa no output final (ver formato abaixo) — não desdobrar automaticamente; desdobrar é uma
   reorganização estrutural manual, dedicada, nunca feita por esta skill.

Reportar o resultado desta checklist no output final da skill (ficheiros cobertos vs. ficheiros que
precisaram de correção adicional face ao Debrief; ficheiros grandes sinalizados).

### Formato da nota de tamanho

```
⚠️ docs/system_spec/01-features/<feature>.md tem 289 linhas (> 200) — considerar desdobrar (reorganização manual).
```

Se a **mesma** nota se repetir em execuções sucessivas desta skill sem que o ficheiro tenha sido
desdobrado entretanto, registar via `regista-aviso` (ver contrato dessa skill — campo `sugestão`
obrigatório e deve nomear a reorganização estrutural manual explicitamente).
