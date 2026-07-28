# Core — Injection Tokens

## `API_URL`

`InjectionToken<string>` — a base URL da API. **Nunca** hardcoded nos services.

```ts
import { InjectionToken } from "@angular/core";
import { environment } from "../../environments/environment";

export const API_URL = new InjectionToken<string>("API_URL", {
  providedIn: "root",
  factory: () => environment.apiUrl,
});
```

- O valor vem de `src/environments/` (ver `06-config.md`).
- Consumido via `inject(API_URL)` nos services.

| Token     | Tipo                     | Valor default (dev)  | Estado   |
| --------- | ------------------------ | -------------------- | -------- |
| `API_URL` | `InjectionToken<string>` | `environment.apiUrl` | pendente |

## Regras

- Um token por configuração injetável transversal; `providedIn: 'root'` com `factory`.
- Nenhum segredo em tokens versionados — segredos via `environment.local.ts` (gitignored).
