# Core — Interceptors

Interceptors funcionais em `src/app/core/interceptors/`, registados via
`provideHttpClient(withInterceptors([...]))` em `app.config.ts`.

## Interceptors

| Interceptor               | Responsabilidade                                                     | Estado       |
| -------------------------- | --------------------------------------------------------------------- | ------------ |
| `bearerTokenInterceptor` | Injeta `Authorization: Bearer <token>` a partir do `SessaoAtivaStore` | implementado |
| `errorInterceptor`        | 409 → toast; mapeia erros para `ApiError`; 5xx/rede                   | pendente     |

Registo em `app.config.ts`: `provideHttpClient(withInterceptors([bearerTokenInterceptor]))`.

## Padrão (funcional, com estado)

Leitura de um signal store dentro de um interceptor funcional — só funciona porque
`provideHttpClient(withInterceptors([...]))` estabelece um contexto de injeção por pedido; testar
exige montar o mesmo provider chain no `TestBed` (`provideHttpClient(withInterceptors([...]))` +
`provideHttpClientTesting()`), nunca invocar a função interceptor a frio:

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessaoAtivaStore } from '../../state/sessao-ativa.store';

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sessaoAtiva = inject(SessaoAtivaStore);
  const token = sessaoAtiva.tokenParaAutorizacao();

  if (sessaoAtiva.estaAutenticado() && token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
```

Leitura de `tokenParaAutorizacao` restrita pelo ESLint a `src/app/core/interceptors/**` — ver
`06-config.md` e `04-core/sessao-ativa.md`.

## Padrão (funcional, com erro)

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
