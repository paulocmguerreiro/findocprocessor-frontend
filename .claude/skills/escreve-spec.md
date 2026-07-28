# Skill: escreve-spec

Traduz o Brief em requisitos técnicos verificáveis, alinhados com a arquitetura do projeto.

> **Categoria:** escreve  
> **Usado em:** `/planeia-issue` (passo 7)  
> **Produz:** `docs/specs/YYYY-MM-DD-<slug>.md`

## Contrato

**Input:**

- `docs/briefs/YYYY-MM-DD-<slug>.md` — incluindo `## Questões em aberto` e `## Riscos identificados`
- Issue body (via `gh issue view $N`) — para herdar CAs e Dependências
- `docs/system_spec/*.md` relevantes
- Seção `## ARQUITETURA` do `CLAUDE.md` do repo ativo
- Resposta do utilizador ao Checkpoint A (deve incluir resolução das questões em aberto)

**Output:** `docs/specs/YYYY-MM-DD-<slug>.md`

**Usado em:** `/planeia-issue` (passo 7)

---

## Formato da Spec

```markdown
# Spec: <título>

**Issue:** #N
**Brief:** docs/briefs/YYYY-MM-DD-<slug>.md
**Data:** YYYY-MM-DD

## Requisitos funcionais

- RF-01: ...
- RF-02: ...

## Requisitos não funcionais

- RNF-01: ...

## Contratos de API (se aplicável)

| Método | Path | Request | Response |
| ------ | ---- | ------- | -------- |
| ...    | ...  | ...     | ...      |

## Modelo de dados (se aplicável)

| Campo | Tipo | Obrigatório | Notas |
| ----- | ---- | ----------- | ----- |
| ...   | ...  | ...         | ...   |

## Regras de negócio

- RN-01: ...

## Dependências

- Issues bloqueantes: [#N — título | "nenhuma"]

## Questões resolvidas

| Questão (do Brief) | Decisão |
| ------------------ | ------- |
| ...                | ...     |

## Critérios de aceitação

> Herdados da issue — nunca remover ou reformular os CAs originais sem justificação.

- [ ] CA-01: ... _(issue)_
- [ ] CA-02: ... _(spec)_

## SYSTEM_SPEC a atualizar

- `docs/system_spec/<ficheiro>.md` — seção X
- Ficheiro novo em `docs/system_spec/` (nova feature slice, novo Model, etc.) → criar o ficheiro **e** atualizar `docs/system_spec/00-index.md` com uma linha na tabela correta

## Verificação RGPD/NIS2

- Dados pessoais: [detalhe]
- Superfície de ataque: [detalhe]
```

---

## Verificação de arquitetura

Antes de gerar a Spec, verificar invariantes da seção `ARQUITETURA` do `CLAUDE.md` e confirmar com o MCP `angular` (`get_best_practices` / `search_documentation`) qualquer API ou comportamento que não seja trivial — em particular quando o Brief identificou questões em aberto ou riscos técnicos com base em documentação.

**Conformidade arquitetural (Standalone + Signals)**
Antes de finalizar a Spec, verificar conformidade com:

- `docs/system_spec/02-shared/contratos-por-camada.md` — checklist por camada (models / core / state / features / shared)
- `docs/system_spec/02-shared/convencoes-nomenclatura.md` — nomenclatura PT/EN
- Invariantes: `standalone: true`, `ChangeDetectionStrategy.OnPush`, Signals nativos (preferencialmente), SSE só no `SseStore`, sem `localStorage`/`sessionStorage`, `multipart/form-data` no upload, lazy `loadComponent()`, `InjectionToken` para `API_URL`, sem `any`.

**Contrato da API (se a issue consome a API) — backend-first**

- A fonte de verdade do contrato é o `openapi.yaml` do **backend Laravel** — o Angular nunca inventa rotas/models/enums/envelope.
- Novo endpoint / schema consumido → a Spec **declara** o delta do contrato que precisa (que rotas/schemas/enums) e confirma se já existem em `src/app/contrato/api.generated.ts`.
- Se o contrato ainda não existe no backend → a Spec marca-o como **dependência backend-first** (issue no repo Laravel); não avançar assumindo campos. Ver `docs/system_spec/02-shared/contrato-api.md`.

---

## Regras

- Cada requisito tem ID (`RF-NN`, `RNF-NN`, `RN-NN`, `CA-NN`)
- CAs da issue são herdados e marcados _(issue)_; CAs adicionados na Spec marcados _(spec)_
- `## Questões resolvidas` cobre todas as entradas de `## Questões em aberto` do Brief
- Critérios de aceitação são verificáveis por testes
- Não incluir detalhes de implementação — isso fica no Plan
