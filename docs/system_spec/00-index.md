# System Spec — Índice

> Porta de entrada. Ler antes de qualquer atualização de spec.
> Para detalhe: abrir apenas o ficheiro indicado — nunca ler todos.

## Features (`01-features/`)

_Nenhuma feature implementada ainda._ Ganham uma linha aqui e um `01-features/<slug>.md` quando
forem construídas (ver `01-features/README.md`).

## Shared (`02-shared/`)

| Assunto                          | Ficheiro                               |
| -------------------------------- | -------------------------------------- |
| Nomenclatura (PT/EN)             | `02-shared/convencoes-nomenclatura.md` |
| Contratos por camada             | `02-shared/contratos-por-camada.md`    |
| Estrutura de pastas de features  | `02-shared/estrutura-subpastas-features.md` |
| Contrato da API (backend-first)  | `02-shared/contrato-api.md`            |
| Envelope de resposta + erros     | `02-shared/envelope-http.md`           |
| Ciclo de estados do documento    | `02-shared/estados.md`                 |
| Padrão — componentes             | `02-shared/padroes-componentes.md`     |
| Padrão — signal stores           | `02-shared/padroes-signals.md`         |

## Models (`03-models/`)

| Assunto                | Ficheiro                          |
| ---------------------- | --------------------------------- |
| Convenções de models   | `03-models/00-convencoes-models.md` |

## Core (`04-core/`)

| Subsistema   | Ficheiro                  |
| ------------ | ------------------------- |
| Services HTTP | `04-core/services.md`     |
| Interceptors  | `04-core/interceptors.md` |
| Tokens        | `04-core/tokens.md`       |
| SSE           | `04-core/sse.md`          |

## Rotas (`05-routes/`)

| Assunto | Ficheiro              |
| ------- | --------------------- |
| Rotas   | `05-routes/rotas.md`  |

## Transversais

| Assunto     | Ficheiro        |
| ----------- | --------------- |
| Configuração | `06-config.md` |
| Testes       | `07-testing.md` |

---

> **Regra:** ficheiro novo em `docs/system_spec/` → adicionar uma linha na tabela correta deste índice, no mesmo commit.
