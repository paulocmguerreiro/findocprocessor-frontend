# Convenções de Models

## Fonte de verdade — contrato gerado

Os tipos de dados da API são **gerados** a partir do `openapi.yaml` do backend, não escritos à mão:

- `src/app/contrato/api.generated.ts` — **gerado** por `openapi-typescript` (via `npm run sync:contract`). Não editar.
- Camada **por recurso**, também gerada por `scripts/gen-models.mjs`: um `<recurso>.model.ts` por recurso
  (`documento.model.ts`, `categoria-documento.model.ts`, …), `enums.ts` (tipos + listas de runtime `*_VALUES`,
  ex: `ESTADO_DOCUMENTO_VALUES`), `errors.ts` (união `ApiError`) e o ficheiro-índice `index.ts`.
- Cada ficheiro gerado tem cabeçalho de aviso — editar à mão perde-se na próxima sincronização.

**Regra:** importar sempre do ficheiro-índice `src/app/contrato` (`index.ts`). Nunca redefinir manualmente um
model/enum/envelope que existe no contrato. Ver `02-shared/contrato-api.md`.

## Modelos à mão — `src/app/models/` vs feature

Modelos escritos à mão (view-models, tipos de UI de domínio próprio) **nunca** vivem em `contrato/`.
Onde vivem depende do alcance:

- **Partilhados por várias features** → `src/app/models/` (`*.model.ts`). Pasta reservada para isto; vazia enquanto não houver necessidade real.
- **Específicos de uma feature** → na própria feature (`*.model.ts` ao lado do componente).

Em qualquer dos casos, o view-model **compõe** os tipos do contrato — nunca os substitui:

```ts
import type { Documento } from '../../contrato';

export interface DocumentoLinhaVM {
  readonly base: Documento;
  readonly rotulo: string;        // derivado para apresentação
  readonly emErro: boolean;
}
```

## Regras
- Sem `any`; `unknown` quando incerto.
- Tipos de domínio próprios (não vindos do contrato) vivem em `03-models/<slug>.md` + `src/app/models/` (partilhados) ou na feature (específicos).
- O que vem da API vive **sempre** em `contrato/` (gerado), nunca redefinido à mão.
