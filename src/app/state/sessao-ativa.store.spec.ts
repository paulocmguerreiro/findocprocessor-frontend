import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SessaoAtivaStore } from './sessao-ativa.store';

describe('SessaoAtivaStore', () => {
  let store: SessaoAtivaStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    store = TestBed.inject(SessaoAtivaStore);
  });

  it('deve_iniciar_sem_sessao_ativa', () => {
    expect(store.tokenParaAutorizacao()).toBeNull();
    expect(store.estaAutenticado()).toBe(false);
  });

  it('deve_registar_token_e_ficar_autenticado', () => {
    store.registarSessao('token-de-teste');

    expect(store.tokenParaAutorizacao()).toBe('token-de-teste');
    expect(store.estaAutenticado()).toBe(true);
  });

  it('deve_sobrepor_token_ao_registar_sessao_nova', () => {
    store.registarSessao('token-antigo');
    store.registarSessao('token-novo');

    expect(store.tokenParaAutorizacao()).toBe('token-novo');
    expect(store.estaAutenticado()).toBe(true);
  });

  it('deve_limpar_token_ao_encerrar_sessao', () => {
    store.registarSessao('token-de-teste');

    store.encerrarSessao();

    expect(store.tokenParaAutorizacao()).toBeNull();
    expect(store.estaAutenticado()).toBe(false);
  });

  // Prende a decisão consciente de RN-04: o store não valida a forma do token.
  // Não é um defeito a corrigir aqui — validar é de quem faz o HTTP.
  it('deve_aceitar_token_vazio_sem_validar', () => {
    store.registarSessao('');

    expect(store.tokenParaAutorizacao()).toBe('');
    expect(store.estaAutenticado()).toBe(true);
  });

  it('deve_encerrar_sessao_sem_sessao_ativa_sem_erro', () => {
    expect(() => store.encerrarSessao()).not.toThrow();
    expect(store.tokenParaAutorizacao()).toBeNull();
    expect(store.estaAutenticado()).toBe(false);
  });
});
