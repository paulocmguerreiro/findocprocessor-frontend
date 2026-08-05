import { computed, Service, signal } from '@angular/core';

/**
 * Custódia em memória do bearer token da sessão ativa.
 *
 * É só estado: não faz HTTP e não persiste nada — sem `localStorage`,
 * `sessionStorage`, cookies ou `TransferState`. Um refresh perde a sessão,
 * por desenho.
 *
 * Recebe sempre uma `string` já resolvida: desembrulhar `Token['data']['token']`
 * (que é `string | undefined`) e confirmar que existe é de quem faz o HTTP. Se
 * o `undefined` escorregasse para cá, `estaAutenticado` passava a ter três
 * valores em vez de dois.
 *
 * Não valida o token: nem forma, nem comprimento, nem prefixo, nem expiração —
 * isso é do backend. Em particular, `registarSessao('')` deixa a aplicação em
 * estado autenticado com uma credencial inútil; não registar o que não se
 * recebeu é responsabilidade de quem chama.
 */
@Service()
export class SessaoAtivaStore {
  readonly #token = signal<string | null>(null);

  /**
   * NÃO RENOMEAR. Este nome é a âncora do seletor `no-restricted-syntax` em
   * `eslint.config.js`, que restringe a leitura do token a
   * `src/app/core/interceptors/**`. Renomeá-lo desliga a proteção em silêncio:
   * o lint continua verde e a barreira deixa de existir.
   */
  readonly tokenParaAutorizacao = this.#token.asReadonly();

  readonly estaAutenticado = computed(() => this.#token() !== null);

  /**
   * Sobrepõe um token já registado sem exigir `encerrarSessao` prévio —
   * registar um token novo é a operação de renovação de sessão.
   */
  registarSessao(token: string): void {
    this.#token.set(token);
  }

  /** Seguro sem sessão ativa: deixa o estado a "sem sessão". */
  encerrarSessao(): void {
    this.#token.set(null);
  }
}
