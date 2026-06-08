# System Spec — 02: State (Signals)

> Actualizado automaticamente após cada Issue pela Fase 3 (documenta-issue).

## Stores planeados (src/app/state/)

| Store                  | Ficheiro              | Responsabilidade                              | Estado   |
| ---------------------- | --------------------- | --------------------------------------------- | -------- |
| `DocumentStore`        | `document.store.ts`   | `signal<Document[]>`, computed filtered/counts | pendente |
| `SseStore`             | `sse.store.ts`        | Subscreve SseService, distribui para stores   | pendente |
| `UiStore`              | `ui.store.ts`         | modalOpen, sseStatus, cycleTimer, uploading   | pendente |

**Regra:** SSE nunca subscrito em componentes — apenas em `SseStore`.

_Vazio até à primeira issue implementada._
