# Plano: AutenticacaoService — login/logout via SessaoAtivaStore

**Issue:** #12
**Spec:** docs/specs/2026-08-06-autenticacao-service.md
**Data:** 2026-08-06

## Tarefas

### Tarefa 1 — Ambientes + `API_URL`

- **Ficheiros a criar/alterar:**
  - `src/environments/environment.ts` (novo)
  - `src/environments/environment.production.ts` (novo)
  - `src/app/core/api-url.token.ts` (novo)
  - `angular.json` — `fileReplacements` na configuração `production` do target `build`
- **O que implementar:**
  - `environment.ts`: `export const environment = { apiUrl: 'http://findocprocessor-backend-laravel.test/api' };`
    — host de Valet, o mesmo que `npm run sync:contract` usa. O `/api` é o prefixo real das rotas do
    backend (`routes/api.php`), não uma escolha de ambiente.
  - `environment.production.ts`: mesma forma, `apiUrl: '/api'` — relativo, mesma origem.
  - Ambos com o mesmo tipo, para que a substituição não passe uma forma diferente ao compilador.
  - `api-url.token.ts`: `InjectionToken<string>` com `providedIn: 'root'` e
    `factory: () => environment.apiUrl`, tal como `04-core/tokens.md` já descreve.
  - `angular.json`, `build.configurations.production.fileReplacements`: `src/environments/environment.ts`
    → `src/environments/environment.production.ts`. O target `build` já tem
    `defaultConfiguration: "production"`, por isso a substituição fica ativa no gate de CI.
- **Testes associados:** nenhum próprio — a verificação é o gate
  `ng build --configuration=production` a passar (RNF-05). Testar um `InjectionToken` com factory
  constante não prova nada que o compilador já não garanta.
- **Cobre:** CA-08, CA-10 (parte de config), RF-09, RF-10, RF-11
- **Commit:** `feat(core): API_URL token e environments dev/produção (#12)`

### Tarefa 2 — Alargar o âmbito de cobertura

- **Ficheiros a criar/alterar:** `angular.json` — `test.options.coverageInclude`
- **O que implementar:** acrescentar `src/app/core/services/**/*.ts` à lista, ao lado de
  `src/app/app.ts`, `src/app/state/**/*.ts` e `src/app/core/interceptors/**/*.ts`. Limiares mantêm-se
  a 95%.
- **Porquê antes da Tarefa 3:** feito depois, o `autenticacao.service.ts` nasceria fora do relatório e o gate
  passaria a verde sem o medir — a armadilha que a #10 já apanhou para `core/interceptors/**`. Feito
  antes, a primeira execução de testes da Tarefa 3 já mede o ficheiro novo.
- **Testes associados:** nenhum próprio; a verificação é `ng test --coverage --watch=false` continuar
  a verde (a pasta ainda só tem `.gitkeep`, logo não baixa a percentagem).
- **Cobre:** CA-11, RF-12
- **Commit:** `chore(testing): incluir core/services no âmbito de cobertura (#12)`

### Tarefa 3 — `AutenticacaoService` + testes

- **Ficheiros a criar/alterar:**
  - `src/app/core/services/autenticacao.service.ts` (novo)
  - `src/app/core/services/autenticacao.service.spec.ts` (novo)
- **O que implementar:**
  - `@Injectable()` **sem** `providedIn: 'root'`. Sem campos de instância além das dependências
    injetadas por `inject()`: `HttpClient`, `API_URL`, `SessaoAtivaStore`.
  - Tipo do body: `PedidoAutenticacao`, importado diretamente de `../../contrato` (schema já nomeado
    no contrato desde 2026-08-10 — nenhuma expressão `paths[...]` necessária). Nenhuma interface
    escrita à mão para a forma do body.
  - `efetuarAutenticacao(credenciais: PedidoAutenticacao): Observable<EnvelopeToken>` — `POST {apiUrl}/auth/login`.
    No caminho de sucesso, desembrulhar `resposta.data.token` por guarda explícita (sem `as string`,
    sem `!`): `string` não vazia → `registarSessao(token)`; `''` → `encerrarSessao()` e emitir erro.
    `data`/`data.token` são obrigatórios no `EnvelopeToken`, logo já não há caso de ausência a tratar —
    só o de token vazio. No caminho de erro, `encerrarSessao()` e repropagar o erro **original**, sem o
    inspecionar.
  - `terminarSessao(): Observable<void>` — `POST {apiUrl}/auth/logout` sem body. `encerrarSessao()` via
    `finalize()` — corre em sucesso, erro **e** cancelamento (exceção deliberada à regra abaixo:
    RN-03 estendida ao cancelamento — logout local não espera confirmação nem sequer conclusão do
    pedido). **Nunca antes de o pedido ser emitido**: o header `Authorization` é anexado pelo
    `bearerTokenInterceptor`, que lê o store no momento da emissão — `finalize()` só corre depois disso.
  - Em `efetuarAutenticacao()`, efeitos dentro do stream (`tap`/`catchError`), **nunca `finalize`** —
    aqui `finalize` correria também no unsubscribe e violaria a RN-06 (cancelar um login não deve
    autenticar).
  - Nenhuma leitura de `tokenParaAutorizacao` — nem no serviço nem no spec (mantém a barreira ESLint
    sem exceções novas).
- **Testes associados** (`autenticacao.service.spec.ts`, `provideHttpClientTesting()` +
  `HttpTestingController`, `SessaoAtivaStore` substituído por duplo com `vi.fn()`):
  - autenticação com sucesso → `registarSessao` com o token; URL e body do pedido conferidos em `expectOne`
  - autenticação 422 `ErrorValidacao` → `encerrarSessao`, erro chega ao chamador
  - autenticação 200 com `data.token === ''` → `encerrarSessao`, `registarSessao` não chamado, erro ao chamador
  - autenticação com sessão já registada + falha → fica encerrado, não mantém a sessão anterior
  - autenticação cancelada antes do `flush()` → nem `registarSessao` nem `encerrarSessao`
  - autenticação/terminar sessão com `status: 0` (falha de rede) e com 429 → `encerrarSessao` + repropagação
  - autenticação 500 com corpo HTML → `encerrarSessao`, erro intacto, sem tocar em `error.detail`
  - terminar sessão com sucesso (204) → `encerrarSessao`; a asserção de `expectOne` passa **antes** do encerramento
  - terminar sessão 401 → `encerrarSessao` na mesma
  - terminar sessão cancelada antes do `flush()` → `encerrarSessao` chamado na mesma (assimétrico face
    ao cancelamento do login — prova o `finalize()` intencional)
  - `httpTesting.verify()` no `afterEach`
  - Nenhum `console.*` com `email`, `password` ou token (RNF-02)
- **Cobre:** CA-01 a CA-07, CA-09, CA-13 a CA-18, CA-16b, RF-01 a RF-08, RF-13
- **Commit:** `feat(core): AutenticacaoService com login/logout via SessaoAtivaStore (#12)`

## Ordem de implementação

1. **Tarefa 1** — porque o `AutenticacaoService` injeta `API_URL`, que não existe sem o `environment`. Sem
   ela, a Tarefa 3 nem compila.
2. **Tarefa 2** — porque tem de estar feita **antes** de existir código em `core/services/`, senão a
   primeira medição de cobertura do serviço novo nunca acontece e o gate dá falso verde.
3. **Tarefa 3** — depende das duas anteriores; é a única que produz comportamento.

Respeita a ordem de camadas do `CLAUDE.md`: `contrato (já gerado) → core (token, service) → state
(store já existente)`. Nada em `features/`.

## Testes a escrever

| Teste | Tipo | Ficheiro | Verifica |
| ----- | ---- | -------- | -------- |
| `deve_registar_sessao_quando_autenticacao_devolve_token` | unit | `autenticacao.service.spec.ts` | CA-02, CA-03 — URL, body e `registarSessao(token)` |
| `deve_encerrar_sessao_quando_autenticacao_falha_com_validacao` | unit | `autenticacao.service.spec.ts` | CA-04 — 422 `ErrorValidacao` |
| `deve_encerrar_sessao_quando_autenticacao_devolve_token_vazio` | unit | `autenticacao.service.spec.ts` | CA-15 — `data.token === ''` |
| `deve_encerrar_sessao_anterior_quando_nova_autenticacao_falha` | unit | `autenticacao.service.spec.ts` | CA-14 / RN-02 |
| `nao_deve_tocar_na_sessao_quando_autenticacao_e_cancelada` | unit | `autenticacao.service.spec.ts` | CA-16 / RN-06 — fixa `tap` vs `finalize` no login |
| `deve_encerrar_sessao_quando_autenticacao_falha_por_rede_ou_excesso_de_tentativas` | unit | `autenticacao.service.spec.ts` | CA-17 — `status: 0` e 429 |
| `deve_repropagar_erro_intacto_quando_resposta_nao_e_json` | unit | `autenticacao.service.spec.ts` | CA-18 / RN-07 — 5xx com HTML |
| `deve_encerrar_sessao_quando_terminar_sessao_devolve_204` | unit | `autenticacao.service.spec.ts` | CA-05 + CA-13 — pedido emitido antes do encerramento |
| `deve_encerrar_sessao_quando_terminar_sessao_falha_com_nao_autenticado` | unit | `autenticacao.service.spec.ts` | CA-06 — 401 |
| `deve_encerrar_sessao_quando_terminar_sessao_e_cancelada` | unit | `autenticacao.service.spec.ts` | CA-16b — fixa `finalize` intencional no logout |

## Dependências

- Issues bloqueantes: **nenhuma**
- Deve ser implementada após: #5 (`SessaoAtivaStore`) e #10 (`bearerTokenInterceptor`) — ambas já
  fechadas

## Riscos de implementação

> Consolidados do Brief (`## Riscos identificados`) e da Spec.

- **O serviço nasce sem provider em produção.** `@Injectable()` sem `providedIn` significa que só
  existe onde for listado num `providers` — e os consumidores (componente de login, menu de logout)
  estão fora de âmbito. Um `inject(AutenticacaoService)` futuro sem `providers` falha com `NullInjectorError`
  **em runtime**, não em compilação. Nesta issue só os testes o fornecem.
- **Duas instâncias, por desenho.** Fornecido em dois componentes, é instanciado duas vezes. Inócuo
  enquanto for stateless — deixa de o ser no dia em que ganhar um campo próprio. A ausência de estado
  é pré-condição da CA-01, não um detalhe.
- **Encerrar cedo demais parte o próprio logout.** Se `encerrarSessao()` corresse antes de o pedido ser
  emitido, este sairia sem `Authorization` e o backend responderia 401 — o serviço provocaria o erro
  que a CA-06 depois trata. A CA-13 existe para fixar esta ordem.
- **`finalize` em vez de `tap` passa despercebido — no login.** Ambos "funcionam" nos testes de sucesso
  e de erro; só o teste de cancelamento (CA-16) os distingue. Sem esse teste, a troca é invisível. No
  logout é o inverso por desenho (2026-08-10): `finalize()` é a escolha certa, e é o CA-16b que a fixa
  — a assimetria entre os dois métodos é intencional, não uma inconsistência a "corrigir".
- **`HttpClient` devolve Observables frios.** Os testes têm de subscrever antes de `expectOne()`, ou o
  pedido nunca é emitido e a asserção falha por razão errada.
- **Falha de autenticação derruba a sessão anterior** (RN-02). É intencional e fica fixado por teste (CA-14),
  para não ser "corrigido" mais tarde por parecer um bug — mesmo tratamento que o
  `SessaoAtivaStore` deu ao caso `registarSessao('')`.
- **Cobertura silenciosamente não medida** se a Tarefa 2 escorregar para depois da Tarefa 3.
- **Base URL errada = 404 em tudo, sem nenhum teste a apanhá-lo.** O `expectOne()` prova a composição
  do URL, nunca o valor do `apiUrl`. Limite conhecido e registado em `WRN-002`.
- **RGPD:** nem serviço nem testes podem logar `email`, `password` ou token; o token não toca em
  `localStorage`/`sessionStorage`/cookies.

## O que NÃO fazer nesta issue

- **Não** registar o `AutenticacaoService` nos `providers` de `app.config.ts` — contradiz a CA-01.
- **Não** acrescentar exceções a `eslint.config.js`: se o lint acusar `tokenParaAutorizacao`, o erro
  está no serviço, não na regra (CA-07).
- **Não** compor o header `Authorization` à mão no `terminarSessao()` — é do `bearerTokenInterceptor` (#10).
- **Não** afirmar o header `Authorization` no `autenticacao.service.spec.ts` — é do spec da #10. Aqui prova-se,
  no máximo, que o serviço **não** o põe.
- **Não** criar componente de login, rota, guard ou qualquer consumidor de `estaAutenticado`.
- **Não** implementar `POST /auth/criar` nem serviço de perfil/permissões — fora do contrato atual.
- **Não** implementar o `errorInterceptor` (409 → toast) — continua pendente, é issue à parte.
- **Não** tocar em `SessaoAtivaStore` nem em `bearer-token.interceptor.ts`.
- **Não** instalar Playwright nem escrever e2e — está registado em `WRN-002` para issue própria.
- **Não** atualizar `docs/system_spec/*.md` — é exclusivo da Fase 3a (`/documenta-implementacao`).
