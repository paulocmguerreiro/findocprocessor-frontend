# Core — Interceptors

Interceptors funcionais em `src/app/core/interceptors/`, registados via
`provideHttpClient(withInterceptors([...]))` em `app.config.ts`.

## Interceptors planeados

| Interceptor        | Responsabilidade                                    | Estado   |
| ------------------ | --------------------------------------------------- | -------- |
| `errorInterceptor` | 409 → toast; mapeia erros para `ApiError`; 5xx/rede | pendente |

## Padrão (funcional)

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((erro) => {
      if (erro.status === 409) { toast.aviso(erro.error?.detail ?? 'Conflito'); }
      return throwError(() => erro);
    }),
  );
};
```

## Regras
- Interceptor **funcional** (`HttpInterceptorFn`), não classe.
- 409 → toast (regra do projeto). Não expor stack/detalhe cru.
- Não logar dados pessoais em claro (RGPD/NIS2).
- Mapear o corpo de erro para a união `ApiError` (`02-shared/envelope-http.md`).
