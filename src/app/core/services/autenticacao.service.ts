import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { API_URL } from '../api-url.token';
import type { EnvelopeToken, paths, PedidoAutenticacao } from '../../contrato';
import { SessaoAtivaStore } from '../../state/sessao-ativa.store';

@Injectable()
export class AutenticacaoService {
  #httpClient = inject(HttpClient);
  #sessaoAtivaStore = inject(SessaoAtivaStore);

  #apiUrl = inject(API_URL);
  #operacaoAutenticacaoURL: keyof paths = '/auth/login';
  #operacaoLogoutURL: keyof paths = '/auth/logout';

  efetuarAutenticacao(
    credenciais: PedidoAutenticacao,
  ): Observable<EnvelopeToken> {
    return this.#httpClient
      .post<EnvelopeToken>(
        `${this.#apiUrl}${this.#operacaoAutenticacaoURL}`,
        credenciais,
      )
      .pipe(
        tap((resposta) => {
          const token = resposta.data.token;
          if (token === '') {
            throw new Error('Autenticação sem token válido');
          }
          this.#sessaoAtivaStore.registarSessao(token);
        }),
        catchError((erro) => {
          this.#sessaoAtivaStore.encerrarSessao();
          return throwError(() => erro);
        }),
      );
  }

  terminarSessao(): Observable<void> {
    return this.#httpClient
      .post<void>(`${this.#apiUrl}${this.#operacaoLogoutURL}`, null)
      .pipe(
        tap(() => this.#sessaoAtivaStore.encerrarSessao()),
        catchError((erro) => {
          this.#sessaoAtivaStore.encerrarSessao();
          return throwError(() => erro);
        }),
      );
  }
}
