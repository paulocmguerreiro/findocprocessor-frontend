# Core — SSE (Server-Sent Events)

O backend emite eventos SSE (progresso do pipeline, log de atividade, timers). No frontend, o stream é
consumido **num único sítio** — o `SseStore` — e distribuído para os outros stores.

## Invariante

> **SSE nunca é subscrito em componentes.** Apenas o `SseStore` (via `SseService`) estabelece/consome o
> `EventSource` e chama métodos dos outros stores (ex: `DocumentStore.atualizarUm(...)`).

## Divisão de responsabilidades

| Peça         | Papel                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| `SseService` (`core/services/`) | Estabelece e mantém a ligação (`EventSource`); reconexão; expõe o stream. |
| `SseStore` (`state/`)           | Subscreve o `SseService`, faz o parse dos eventos e distribui para os stores de domínio. Expõe `estadoLigacao` como signal. |
| Componentes  | Lêem signals dos stores (incl. `SseStore.estadoLigacao`) — nunca abrem SSE. |

## Eventos (contrato)

Os payloads dos eventos seguem tipos do contrato (ex: `Documento`, `EtapaDocumento`). O tipo de união dos
eventos SSE deriva do contrato — não inventar formas de evento no frontend; se um evento novo é preciso,
é backend-first (`02-shared/contrato-api.md`).

## Zoneless

Como a app é zoneless, cada evento recebido escreve num `signal` para propagar a mudança à UI
(ver `angular-best-practices` → change-detection-zoneless).

## Regras
- Uma só ligação SSE por sessão (no `SseStore`).
- Reconexão/backoff no `SseService`.
- Nos testes, mockar o `SseStore` — nunca abrir SSE real.
