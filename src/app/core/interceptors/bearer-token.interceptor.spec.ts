import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { bearerTokenInterceptor } from './bearer-token.interceptor';
import { SessaoAtivaStore } from '../../state/sessao-ativa.store';

describe('bearerTokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let sessaoAtiva: SessaoAtivaStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([bearerTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    sessaoAtiva = TestBed.inject(SessaoAtivaStore);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve_injetar_header_authorization_quando_token_presente', () => {
    sessaoAtiva.registarSessao('abc');

    httpClient.get('/api/pedido').subscribe();

    const pedido = httpTestingController.expectOne('/api/pedido');
    expect(pedido.request.headers.get('Authorization')).toBe('Bearer abc');
    pedido.flush({});
  });

  it('nao_deve_injetar_header_quando_token_null', () => {
    sessaoAtiva.encerrarSessao();

    httpClient.get('/api/pedido').subscribe();

    const pedido = httpTestingController.expectOne('/api/pedido');
    expect(pedido.request.headers.has('Authorization')).toBe(false);
    pedido.flush({});
  });

  it('nao_deve_injetar_header_quando_token_vazio', () => {
    sessaoAtiva.registarSessao('');

    httpClient.get('/api/pedido').subscribe();

    const pedido = httpTestingController.expectOne('/api/pedido');
    expect(pedido.request.headers.has('Authorization')).toBe(false);
    pedido.flush({});
  });
});
