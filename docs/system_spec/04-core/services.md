# Core — Services HTTP

Services em `src/app/core/services/`. Acesso HTTP à API; uma responsabilidade cada; `providedIn: 'root'`
por omissão (ver exceção abaixo).

## Implementados

### `AutenticacaoService`

`src/app/core/services/autenticacao.service.ts` — `efetuarAutenticacao()` (`POST /auth/login`) e
`terminarSessao()` (`POST /auth/logout`), com os efeitos sobre o `SessaoAtivaStore`
(`04-core/sessao-ativa.md`) dentro do stream devolvido.

**Desvio deliberado ao padrão-tipo:** `@Injectable()` **sem** `providedIn: 'root'`, não `@Service()`.
`@Service()` provisiona sempre na raiz (é sempre singleton, salvo `autoProvided: false`); este serviço é
intencionalmente **não-singleton** — é stateless (nenhum campo de instância além das dependências
injetadas), pelo que ter duas instâncias em componentes diferentes é inócuo, e forçar um singleton
esconderia essa garantia. Fornecido via `providers` de quem o consome (ainda não há consumidor — nenhum
componente de login/logout implementado nesta issue).

Os dois métodos divergem deliberadamente na forma como tratam o cancelamento (`unsubscribe` antes da
resposta chegar):

| Método | Operador | Cancelamento |
| ------ | -------- | ------------ |
| `efetuarAutenticacao()` | `tap`/`catchError` | Não toca no store — cancelar um login não deve autenticar |
| `terminarSessao()` | `finalize()` | Encerra a sessão na mesma — extensão do "logout local não espera confirmação do backend" ao cancelamento: uma navegação a meio do pedido não deve deixar a app "meio autenticada" |

A guarda de token vazio (`data.token === ''`) vive dentro do `tap` de `efetuarAutenticacao()`: um
`throw` síncrono no callback converte a stream numa notificação de erro, apanhada pelo `catchError`
seguinte — não precisa de `switchMap`/`throwError` explícito para este ramo.

## Padrão (novos services)

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
