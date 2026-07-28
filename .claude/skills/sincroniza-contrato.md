# Skill: sincroniza-contrato

Sincroniza os tipos do frontend com o contrato da API do backend. Passagem facilitada de novas
rotas/resources/enums/envelope a partir do `openapi.yaml` do backend Laravel para `src/app/contrato/`.

> **Categoria:** sincroniza
> **Usado em:** `/documenta-implementacao` (passo 5b), e sob demanda sempre que o contrato do backend muda
> **Produz:** `src/app/contrato/api.generated.ts` regenerado + relatório de drift + `docs/system_spec/02-shared/contrato-api.md` atualizado

## Contrato (da skill)

**Input:** `openapi.yaml` do backend (fonte de verdade), obtido por **URL web** (não por ficheiro sibling):

- **Preferencial** — Valet em dev (versão mais atualizada): `http://findocprocessor-backend-laravel.test/openapi.yaml` → `npm run sync:contract`
- **Fallback** — GitHub, quando o backend não está a correr localmente: `npm run sync:contract:github`.
  ⚠️ Tem de ser o **raw** (`https://raw.githubusercontent.com/paulocmguerreiro/findocprocessor-backend-laravel/main/openapi.yaml`), **nunca** o URL `.../blob/...` (é HTML, o `openapi-typescript` não o parseia).

**Output:**

- `src/app/contrato/api.generated.ts` regenerado (via `openapi-typescript`)
- relatório de drift (rotas/schemas/enums novos, alterados ou removidos)
- `docs/system_spec/02-shared/contrato-api.md` atualizado com o delta consumido

## Princípio — backend-first (inviolável)

O Angular **nunca** inventa rotas, models, resources, enums ou envelope. A fonte de verdade é o
`openapi.yaml` do backend. Se o frontend precisa de algo que não existe no contrato, isso é uma
**dependência backend-first**: prepara-se primeiro no repo Laravel, e só depois se sincroniza aqui.
Ver `docs/system_spec/02-shared/contrato-api.md`.

> ⚠️ Esta skill **não** tem nada a ver com o antigo `sync-references.py` de commands/skills (banido —
> ver aviso PW-001 em `docs/process-warnings.md`). Aqui só se sincronizam **tipos de dados**, nunca `.claude/`.

## Passos

1. **Regenerar** os tipos (a origem é sempre um URL web):
   ```bash
   npm run sync:contract          # preferencial: Valet http://findocprocessor-backend-laravel.test/openapi.yaml
   # ou, se o backend não estiver a correr localmente:
   npm run sync:contract:github   # fallback: raw.githubusercontent.com/.../main/openapi.yaml
   ```
2. **Detetar drift** — comparar o antes/depois:
   ```bash
   git diff --stat src/app/contrato/api.generated.ts
   git diff src/app/contrato/api.generated.ts
   ```
   Classificar as diferenças: rotas novas/alteradas/removidas, schemas novos/alterados, enums com
   valores adicionados/removidos.
3. **Confirmar a regeneração da camada por recurso** — o `npm run sync:contract` já correu
   `scripts/gen-models.mjs`, que reescreve `*.model.ts` + `enums.ts` + `errors.ts` + `index.ts` a partir
   do `api.generated.ts` (recursos novos → ficheiros novos; recursos removidos → ficheiros removidos pelo
   marcador de "FICHEIRO GERADO"). Não editar estes ficheiros à mão. Validar que compila:
   ```bash
   npx tsc --noEmit -p tsconfig.app.json
   ```
4. **Nada a atualizar à mão em `src/app/contrato/`** — é tudo gerado. As listas de runtime (`enums.ts`) e a
   união `ApiError` (`errors.ts`) saem automaticamente do contrato. Se o `tsc` falhar, é drift real no
   **código consumidor** (usava um campo/enum que mudou) — corrigir o código que consome, não os gerados.
5. **Atualizar o spec** — `docs/system_spec/02-shared/contrato-api.md`: registar as rotas/schemas/enums
   agora disponíveis para consumo, e a data/versão do contrato sincronizado.
6. **Reportar**:
   ```
   ✅ Contrato sincronizado (openapi.yaml @ <versão>)
   Drift:
     + rotas novas:   <lista ou "nenhuma">
     ~ schemas alterados: <lista ou "nenhum">
     + enums:         <valores adicionados/removidos ou "sem alterações">
   tsc: ✅ (guardião de exaustividade a verde)
   Spec: docs/system_spec/02-shared/contrato-api.md atualizado
   ```

## Regras

- **Nunca** editar `src/app/contrato/api.generated.ts` à mão — é regenerado; alterações manuais perdem-se.
- Os componentes/stores/services importam do ficheiro-índice `src/app/contrato` (`index.ts`), não do gerado — ponto de importação estável.
- Se o `tsc` falhar após regenerar, é drift real: resolver as listas de runtime **antes** de continuar.
- Se o contrato necessário não existe no backend → **parar** e sinalizar a dependência backend-first; não inventar tipos.
- Correr esta skill num commit próprio: `📝 chore: sincronizar contrato da API (openapi.yaml @ <versão>)`.
