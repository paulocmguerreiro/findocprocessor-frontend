# Core — Services HTTP

Services em `src/app/core/services/`. Acesso HTTP à API; uma responsabilidade cada; `providedIn: 'root'`.

_Nenhum service implementado ainda._ Documentam-se aqui à medida que forem criados.

## Padrão

```ts
import { inject, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "../api-url.token";
import type { Documento } from "../../contrato";

// @Service() (v22) = atalho de @Injectable({ providedIn: 'root' }); só suporta inject().
// Usar @Injectable quando é preciso DI por construtor, scopes não-root ou useClass/useValue/useFactory.
@Service()
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listar() {
    return this.http.get<Documento[]>(`${this.apiUrl}/documentos`);
  }

  upload(ficheiro: File) {
    const form = new FormData(); // multipart/form-data — nunca base64
    form.append("ficheiro", ficheiro);
    return this.http.post<Documento>(`${this.apiUrl}/documentos/upload`, form);
  }
}
```

## Regras

- `inject()` para `HttpClient` e `API_URL`; sem estado de UI (isso é dos stores).
- Tipos de/para o contrato (ficheiro-índice `src/app/contrato`).
- Upload sempre `FormData`.
- `HttpClient` para leituras **e** mutações — **não** usar `httpResource()`/`resource()` neste projeto.
- Erros globais tratados pelo `ErrorInterceptor` — o service não duplica tratamento de 409.
