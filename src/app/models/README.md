# `src/app/models/` — modelos escritos à mão (só-Angular)

Esta pasta é para **tipos/view-models escritos à mão que só existem no frontend** e são
**partilhados por várias features** (ex: um view-model que achata `historico`, tipos de UI de
domínio próprio). Está **vazia até haver necessidade real** — não criar tipos "por antecipação".

## O que **não** vai aqui

- **Tipos vindos da API** → `src/app/contrato/` (100% gerado do `openapi.yaml` do backend; nunca
  redefinir à mão). Ver `docs/system_spec/02-shared/contrato-api.md`.
- **View-models específicos de uma só feature** → na própria feature, ao lado do componente.

## Regra

Um modelo à mão **compõe** os tipos do contrato — nunca os substitui:

```ts
import type { Documento } from '../contrato';

export interface DocumentoLinhaVM {
  readonly base: Documento;
  readonly rotulo: string; // derivado para apresentação
}
```

> Convenções completas: `docs/system_spec/03-models/00-convencoes-models.md`.
