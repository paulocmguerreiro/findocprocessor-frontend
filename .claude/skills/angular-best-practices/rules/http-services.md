# HTTP, Services & Contract

## Services
- `@Service` (v22+) ou `@Injectable({ providedIn: 'root' })` para singletons; uma responsabilidade por service.
- `inject()` para dependências.
- Services HTTP em `src/app/core/services/`.

## HttpClient
- Configurar com `provideHttpClient(withInterceptors([errorInterceptor]))` em `app.config.ts`.
- `HttpClient` para **leituras e mutações** (GET/POST/PUT/DELETE). Neste projeto **não** se usa `httpResource()`/`resource()` — o estado reativo vive nos signal stores, alimentados pelas respostas do `HttpClient`.
- `InjectionToken<string>` para `API_URL` (`src/app/core/`) — nunca URL hardcoded. Ver `docs/system_spec/04-core/tokens.md`.

## Contrato da API (backend-first)
- Os tipos (models, enums, envelope) são **gerados** a partir do `openapi.yaml` do backend Laravel para `src/app/contrato/api.generated.ts` (via `npm run sync:contract`).
- **Nunca** redefinir manualmente um model/enum/rota que existe no contrato — importar do ficheiro-índice `src/app/contrato` (`index.ts`).
- Se falta contrato → é dependência **backend-first**: prepara-se primeiro no repo Laravel. Ver `docs/system_spec/02-shared/contrato-api.md`.

## Envelope & erros
- Erros 409 tratados globalmente no `ErrorInterceptor` → toast. Ver `docs/system_spec/02-shared/envelope-http.md`.
- Respostas de erro seguem o envelope do contrato (`status`/`detail`/`errors`).

## Upload
- Sempre `multipart/form-data` (`FormData`) — **nunca** base64 em JSON.
