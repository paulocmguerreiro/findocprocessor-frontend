# Security & Compliance

- **Nunca** usar `localStorage` ou `sessionStorage` — nenhum dado sensível é persistido no browser.
- Upload sempre `multipart/form-data` (`FormData`) — nunca base64 em JSON.
- Erros 409 intercetados globalmente → toast (não expor detalhe técnico cru ao utilizador).
- Sem `any` no TypeScript; `unknown` quando o tipo é incerto; strict mode nunca desativado.
- Não hardcodar URLs ou segredos — `API_URL` via `InjectionToken`; ambiente via `src/environments/` (o ficheiro `environment.local.ts` é gitignored).
- Sanitização: confiar no sanitizer do Angular; evitar `bypassSecurityTrust*` sem justificação documentada.
- RGPD/NIS2: não logar dados pessoais em claro na consola; minimizar dados retidos em memória.
