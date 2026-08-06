import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessaoAtivaStore } from '../../state/sessao-ativa.store';

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sessaoAtiva = inject(SessaoAtivaStore);
  const token = sessaoAtiva.tokenParaAutorizacao() ?? '';

  if (sessaoAtiva.estaAutenticado() && token.length > 0) {
    return next(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
  }

  return next(req);
};
