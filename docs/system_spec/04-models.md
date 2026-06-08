# System Spec — 04: Models (Interfaces, Enums, DTOs)

> Actualizado automaticamente após cada Issue pela Fase 3 (documenta-issue).

## Interfaces planeadas (src/app/models/)

### Document (document.model.ts)
```typescript
interface Document {
  id: string;
  status: DocumentStatus;
  originalFilename: string;
  storedPath: string;
  tipoDocumento?: string;
  categoria?: string;
  fornecedor?: string;
  cliente?: string;
  valorTotal?: number;
  dataDocumento?: string;
  nifFornecedor?: string;
  nifCliente?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

enum DocumentStatus {
  Pending = 'pending',
  AguardaEnvio = 'aguarda_envio',
  Enviado = 'enviado',
  AguardaResposta = 'aguarda_resposta',
  Done = 'done',
  Error = 'error',
  Perigoso = 'perigoso',
}
```

### SseEvent (sse-event.model.ts)
Union type: `DocumentEvent | LogEvent | TimerEvent` — _pendente._

_Vazio até à primeira issue implementada._
