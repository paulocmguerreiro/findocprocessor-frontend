# System Spec — 03: Core (Services, Interceptors, Tokens)

> Actualizado automaticamente após cada Issue pela Fase 3 (documenta-issue).

## Services planeados (src/app/core/services/)

| Service           | Responsabilidade                              | Estado   |
| ----------------- | --------------------------------------------- | -------- |
| `DocumentService` | CRUD HTTP para documentos                     | pendente |
| `SseService`      | Estabelece e mantém SSE connection            | pendente |
| `FileService`     | Listar e abrir ficheiros em processed/        | pendente |
| `ConfigService`   | Configurações e extraction templates          | pendente |

## Interceptors (src/app/core/interceptors/)

| Interceptor        | Responsabilidade                                | Estado   |
| ------------------ | ----------------------------------------------- | -------- |
| `ErrorInterceptor` | 409 → toast; erros globais                      | pendente |

## Tokens (src/app/core/)

| Token             | Tipo              | Valor default               |
| ----------------- | ----------------- | --------------------------- |
| `API_URL`         | `InjectionToken<string>` | `http://localhost:5000` |

_Vazio até à primeira issue implementada._
