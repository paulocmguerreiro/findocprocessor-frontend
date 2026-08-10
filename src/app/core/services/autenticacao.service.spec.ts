import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_URL } from '../api-url.token';
import type { EnvelopeToken, PedidoAutenticacao } from '../../contrato';
import { SessaoAtivaStore } from '../../state/sessao-ativa.store';
import { AutenticacaoService } from './autenticacao.service';

const API_URL_TESTE = 'http://api.teste';
const LOGIN_URL = `${API_URL_TESTE}/auth/login`;
const LOGOUT_URL = `${API_URL_TESTE}/auth/logout`;

const CREDENCIAIS: PedidoAutenticacao = {
  email: 'utilizador@exemplo.pt',
  password: 'segredo-muito-secreto',
};

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;
  let httpTestingController: HttpTestingController;
  let sessaoAtivaStore: {
    registarSessao: ReturnType<typeof vi.fn>;
    encerrarSessao: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    sessaoAtivaStore = {
      registarSessao: vi.fn(),
      encerrarSessao: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        AutenticacaoService,
        { provide: API_URL, useValue: API_URL_TESTE },
        { provide: SessaoAtivaStore, useValue: sessaoAtivaStore },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AutenticacaoService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve_registar_sessao_quando_autenticacao_devolve_token', () => {
    let resposta: EnvelopeToken | undefined;
    service.efetuarAutenticacao(CREDENCIAIS).subscribe((r) => (resposta = r));

    const pedido = httpTestingController.expectOne(LOGIN_URL);
    expect(pedido.request.method).toBe('POST');
    expect(pedido.request.body).toEqual(CREDENCIAIS);

    pedido.flush({ data: { token: 'token-valido' } });

    expect(sessaoAtivaStore.registarSessao).toHaveBeenCalledExactlyOnceWith(
      'token-valido',
    );
    expect(sessaoAtivaStore.encerrarSessao).not.toHaveBeenCalled();
    expect(resposta).toEqual({ data: { token: 'token-valido' } });
  });

  it('deve_encerrar_sessao_quando_autenticacao_falha_com_validacao', () => {
    let erroCapturado: unknown;
    service.efetuarAutenticacao(CREDENCIAIS).subscribe({
      error: (erro) => (erroCapturado = erro),
    });

    const pedido = httpTestingController.expectOne(LOGIN_URL);
    pedido.flush(
      { detail: 'Dados inválidos', errors: { email: ['obrigatório'] } },
      { status: 422, statusText: 'Unprocessable Content' },
    );

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(sessaoAtivaStore.registarSessao).not.toHaveBeenCalled();
    expect(erroCapturado).toBeTruthy();
  });

  it('deve_encerrar_sessao_quando_autenticacao_devolve_token_vazio', () => {
    let erroCapturado: unknown;
    service.efetuarAutenticacao(CREDENCIAIS).subscribe({
      error: (erro) => (erroCapturado = erro),
    });

    const pedido = httpTestingController.expectOne(LOGIN_URL);
    pedido.flush({ data: { token: '' } });

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(sessaoAtivaStore.registarSessao).not.toHaveBeenCalled();
    expect(erroCapturado).toBeTruthy();
  });

  it('deve_encerrar_sessao_anterior_quando_nova_autenticacao_falha', () => {
    service.efetuarAutenticacao(CREDENCIAIS).subscribe();
    httpTestingController
      .expectOne(LOGIN_URL)
      .flush({ data: { token: 'sessao-anterior' } });
    expect(sessaoAtivaStore.registarSessao).toHaveBeenCalledExactlyOnceWith(
      'sessao-anterior',
    );

    service
      .efetuarAutenticacao(CREDENCIAIS)
      .subscribe({ error: () => undefined });
    httpTestingController
      .expectOne(LOGIN_URL)
      .flush({ detail: 'Erro' }, { status: 422, statusText: 'Unprocessable Content' });

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
  });

  it('nao_deve_tocar_na_sessao_quando_autenticacao_e_cancelada', () => {
    const subscription = service.efetuarAutenticacao(CREDENCIAIS).subscribe();
    const pedido = httpTestingController.expectOne(LOGIN_URL);

    subscription.unsubscribe();

    expect(pedido.cancelled).toBe(true);
    expect(sessaoAtivaStore.registarSessao).not.toHaveBeenCalled();
    expect(sessaoAtivaStore.encerrarSessao).not.toHaveBeenCalled();
  });

  it('deve_encerrar_sessao_quando_autenticacao_falha_por_rede', () => {
    let erroCapturado: unknown;
    service.efetuarAutenticacao(CREDENCIAIS).subscribe({
      error: (erro) => (erroCapturado = erro),
    });

    httpTestingController
      .expectOne(LOGIN_URL)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(erroCapturado).toBeTruthy();
  });

  it('deve_encerrar_sessao_quando_autenticacao_excede_limite_de_pedidos', () => {
    let erroCapturado: unknown;
    service.efetuarAutenticacao(CREDENCIAIS).subscribe({
      error: (erro) => (erroCapturado = erro),
    });

    httpTestingController
      .expectOne(LOGIN_URL)
      .flush(
        { detail: 'Demasiados pedidos' },
        { status: 429, statusText: 'Too Many Requests' },
      );

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(erroCapturado).toBeTruthy();
  });

  it('deve_repropagar_erro_intacto_quando_resposta_nao_e_json', () => {
    let erroCapturado: unknown;
    service.efetuarAutenticacao(CREDENCIAIS).subscribe({
      error: (erro) => (erroCapturado = erro),
    });

    const corpoHtml = '<html><body>Internal Server Error</body></html>';
    httpTestingController
      .expectOne(LOGIN_URL)
      .flush(corpoHtml, { status: 500, statusText: 'Internal Server Error' });

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(erroCapturado).toMatchObject({ status: 500, error: corpoHtml });
  });

  it('deve_encerrar_sessao_quando_terminar_sessao_devolve_204', () => {
    let concluido = false;
    service.terminarSessao().subscribe({ complete: () => (concluido = true) });

    const pedido = httpTestingController.expectOne(LOGOUT_URL);
    expect(pedido.request.method).toBe('POST');
    expect(sessaoAtivaStore.encerrarSessao).not.toHaveBeenCalled();

    pedido.flush(null, { status: 204, statusText: 'No Content' });

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(concluido).toBe(true);
  });

  it('deve_encerrar_sessao_quando_terminar_sessao_falha_com_nao_autenticado', () => {
    let erroCapturado: unknown;
    service.terminarSessao().subscribe({
      error: (erro) => (erroCapturado = erro),
    });

    httpTestingController
      .expectOne(LOGOUT_URL)
      .flush(
        { detail: 'Não autenticado' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(erroCapturado).toBeTruthy();
  });

  it('deve_encerrar_sessao_quando_terminar_sessao_falha_por_rede', () => {
    let erroCapturado: unknown;
    service.terminarSessao().subscribe({
      error: (erro) => (erroCapturado = erro),
    });

    httpTestingController
      .expectOne(LOGOUT_URL)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
    expect(erroCapturado).toBeTruthy();
  });

  it('deve_encerrar_sessao_quando_terminar_sessao_e_cancelada', () => {
    const subscription = service.terminarSessao().subscribe();
    const pedido = httpTestingController.expectOne(LOGOUT_URL);

    subscription.unsubscribe();

    expect(pedido.cancelled).toBe(true);
    expect(sessaoAtivaStore.encerrarSessao).toHaveBeenCalledOnce();
  });

  it('nao_deve_logar_dados_sensiveis_durante_autenticacao_e_logout', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    service.efetuarAutenticacao(CREDENCIAIS).subscribe();
    httpTestingController
      .expectOne(LOGIN_URL)
      .flush({ data: { token: 'token-valido' } });

    service.terminarSessao().subscribe();
    httpTestingController
      .expectOne(LOGOUT_URL)
      .flush(null, { status: 204, statusText: 'No Content' });

    for (const spy of [logSpy, errorSpy, warnSpy]) {
      for (const chamada of spy.mock.calls) {
        const texto = JSON.stringify(chamada);
        expect(texto).not.toContain(CREDENCIAIS.email);
        expect(texto).not.toContain(CREDENCIAIS.password);
        expect(texto).not.toContain('token-valido');
      }
    }

    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
