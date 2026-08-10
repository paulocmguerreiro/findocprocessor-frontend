# Brief: AutenticacaoService — login/logout via SessaoAtivaStore

**Issue:** #12
**Data:** 2026-08-06
**Branch:** feat/autenticacao-service

## Contexto

O `SessaoAtivaStore` (#5) guarda o bearer token em memória e é a única entidade que responde a "há alguém autenticado?" —
mas é só custódia: não faz HTTP e nunca é alimentado por ninguém. O `bearerTokenInterceptor` (#10) já
lê `tokenParaAutorizacao` e anexa `Authorization: Bearer <token>` a todos os pedidos — mas só tem
efeito depois de alguém ter registado uma sessão. Hoje `estaAutenticado()` é permanentemente `false`
em runtime: nada na aplicação chama `registarSessao`.

Falta a peça que faz HTTP contra a API e traduz o resultado para o store: autenticar (`POST /auth/login`),
desembrulhar o token do envelope, registá-lo — e encerrar a sessão em logout ou em erro, para que o
estado local nunca fique a afirmar algo que o backend não confirma.

O `04-core/sessao-ativa.md` já antecipa este serviço em dois pontos: é ele "quem desembrulha o token"
(`Token['data']['token']` é `string | undefined`; o store recebe sempre uma `string` resolvida) e é
uma das peças listadas em "Fora de âmbito (por implementar)". Esta issue fecha essa lacuna.

Duas dependências de infraestrutura vêm à boleia por serem pré-requisito real e não existirem ainda em
código: o `InjectionToken` `API_URL` (documentado em `04-core/tokens.md` com estado "pendente") e o
`src/environments/environment.ts` (`src/environments/` só tem `.gitkeep`). Sem eles não há base URL
para o serviço compor os pedidos.

## O que muda

- **Novo `src/app/core/services/autenticacao.service.ts`** — `AutenticacaoService` com `efetuarAutenticacao(credenciais)` e
  `terminarSessao()`. Primeiro service HTTP do projeto (`04-core/services.md` diz hoje "nenhum service
  implementado ainda"). Injeta `HttpClient` e `API_URL`; escreve no `SessaoAtivaStore` via
  `registarSessao`/`encerrarSessao` e nunca lê `tokenParaAutorizacao`.
- **Escopo de DI não-root** — `@Injectable()` sem `providedIn: 'root'`, fornecido pelos consumidores
  (CA-01). É um desvio explícito ao padrão-tipo de `04-core/services.md` (que assume `@Service()`/root)
  e à recomendação do MCP `angular` `get_best_practices` para v22 ("prefer the `@Service` decorator
  over `@Injectable({providedIn: 'root'})` for new singleton services") — recomendação que se aplica a
  singletons genuínos, condição que este serviço não cumpre por desenho.
- **Novo `src/app/core/api-url.token.ts`** — `API_URL: InjectionToken<string>` com `providedIn: 'root'`
  e `factory: () => environment.apiUrl`, exatamente como `04-core/tokens.md` já descreve. Passa de
  "pendente" a implementado.
- **Novo `src/environments/environment.ts`** — expõe pelo menos `apiUrl`.
- **`angular.json`** (target `test`, `coverageInclude`) — alargar para apanhar `src/app/core/services/**`,
  hoje restrito a `src/app/app.ts` + `src/app/state/**` + `src/app/core/interceptors/**`.
- **Novo `src/app/core/services/autenticacao.service.spec.ts`** — os 4 cenários da CA-09 com
  `HttpTestingController` e `SessaoAtivaStore` mockado.
- **Tipo do body de login** derivado do contrato
  (`paths['/auth/login']['post']['requestBody']['content']['application/json']`), importado via o
  ficheiro-índice `src/app/contrato` — que já reexporta `paths`. Sem redeclarar `{ email, password }`
  à mão.

## O que NÃO muda

- **`SessaoAtivaStore`** — já expõe tudo o necessário; nenhuma alteração ao ficheiro nem ao seu spec.
- **`bearerTokenInterceptor`** — o `terminarSessao()` não injeta o header manualmente; o pedido sai já com
  `Authorization` porque o interceptor está registado globalmente em `app.config.ts`.
- **`eslint.config.js`** — o serviço só escreve no store, por isso não precisa de exceção à regra
  `no-restricted-syntax` de `tokenParaAutorizacao`. A barreira fica intacta e sem novos furos.
- **`app.config.ts`** — não ganha o `AutenticacaoService` nos `providers` (seria contradizer CA-01). Ganha,
  no máximo, nada: `API_URL` é `providedIn: 'root'` via factory, não precisa de registo explícito.
- **UI e rotas** — nenhum componente de login, nenhuma rota, nenhum guard, nenhum consumidor de
  `estaAutenticado`. São issues próprias. O serviço nasce sem consumidor de produção (ver Riscos).
- **`POST /auth/criar`** (registo) e serviço de perfil/permissões (`GET /auth/me`) — fora do contrato
  atual; dependência backend-first futura.
- **`errorInterceptor`** (409 → toast, `02-shared/envelope-http.md`) — continua pendente; o
  `AutenticacaoService` não duplica tratamento global de erro, apenas garante a coerência do estado de sessão
  antes de repropagar.

## Riscos identificados

- **O serviço nasce sem provider em toda a aplicação.** Com `@Injectable()` sem `providedIn`, o
  `AutenticacaoService` só existe onde for listado num `providers` — e os dois consumidores previstos
  (componente de login, menu de logout) estão fora de âmbito e não existem. Consequência concreta:
  qualquer `inject(AutenticacaoService)` futuro num sítio sem `providers` falha com `NullInjectorError` **em
  runtime**, não em compilação — e nesta issue nem sequer há onde o erro se manifeste, porque só os
  testes o fornecem. O risco não é o desenho (é defensável e está fundamentado na CA-01), é o intervalo
  de tempo em que a decisão fica sem consumidor que a demonstre.
- **Duas instâncias, por desenho.** Fornecido em dois componentes distintos, o `AutenticacaoService` é
  instanciado duas vezes. Hoje é inócuo — é stateless e todo o estado vive no `SessaoAtivaStore`
  singleton. Deixa de ser inócuo no dia em que ganhar qualquer campo próprio (cache, flag de pedido em
  curso): passariam a existir dois estados divergentes sem nenhum erro visível. A ausência de estado
  não é um detalhe do serviço, é a pré-condição da CA-01.
- **Cobertura silenciosamente não medida.** `coverageInclude` (`angular.json`, target `test`) não
  inclui `src/app/core/services/**`. Sem alargar, o `autenticacao.service.ts` e o seu spec ficam fora do
  relatório `@vitest/coverage-v8` e do limiar de 95%: o gate passa a verde sem medir o ficheiro novo.
  É exatamente a armadilha que a Issue #10 já apanhou para `core/interceptors/**` — e que
  `07-testing.md` fixa como regra ("alargar o âmbito é decisão da issue que criar código novo numa
  pasta ainda sem testes").
- **Build de produção com a URL de desenvolvimento.** A CA-08 pede só `environment.ts`, e o
  `angular.json` não tem `fileReplacements` em nenhuma configuração. Resultado: o gate de CI
  `ng build --configuration=production` compila e passa, mas o bundle de produção fica com a `apiUrl`
  de dev embutida — sem aviso do compilador. O `06-config.md` já documenta `environment.production.ts`
  como ficheiro esperado; a distância entre o documentado e o existente é o risco (ver Questões).
- **Base URL errada = 404 em todos os pedidos.** O `openapi.yaml` do backend declara
  `servers: http://localhost:8000/api`, mas `npm run sync:contract` aponta a Valet
  (`http://findocprocessor-backend-laravel.test`). Confirmado em `routes/api.php` do backend que as
  rotas estão sob o prefixo `/api` (`Route::post('auth/login', ...)`), logo a base tem de terminar em
  `/api` — esquecer o sufixo, ou escolher o host errado, dá 404 em tudo sem erro de tipos.
- **Encerrar a sessão cedo demais parte o próprio logout.** O `POST /auth/logout` só leva o header
  `Authorization` porque o `bearerTokenInterceptor` lê o store no momento em que o pedido é emitido.
  Se `encerrarSessao()` corresse antes de emitir, o pedido saía sem token e o backend responderia 401 —
  o serviço provocaria o erro que a CA-06 depois trata. O encerramento tem de acontecer no **resultado**
  (sucesso e erro), nunca antes.
- **`HttpClient` devolve Observables frios: sem subscrição, nada acontece.** Se os efeitos em
  `SessaoAtivaStore` viverem dentro do stream devolvido (o padrão natural com `tap`), um chamador que
  não subscreva não dispara nem o pedido nem o `registarSessao`/`encerrarSessao`. Não é bug do serviço,
  mas é uma armadilha real na fronteira com o futuro componente de login, e condiciona como os testes
  são escritos (têm de subscrever antes de `expectOne()`).
- **Falha de login derruba a sessão anterior.** A CA-04 manda chamar `encerrarSessao()` em qualquer
  erro de login. Um utilizador já autenticado que erre a password num re-login perde a sessão válida
  que tinha. É intencional ("nunca deixa uma sessão parcial ou anterior por engano") e o efeito deve
  ficar fixado por teste, para não ser "corrigido" mais tarde por parecer um bug — mesmo tratamento que
  `SessaoAtivaStore` deu ao caso `registarSessao('')`.
- **200 sem token é um buraco tipado no contrato.** `Token` é `{ data?: { token?: string } }` — uma
  resposta 200 sem `data.token` é válida à luz do contrato e não é nenhum dos ramos que a CA-03 ou a
  CA-04 descrevem (não é sucesso utilizável nem erro HTTP). Sem decisão explícita, o caminho de menor
  esforço é registar `undefined` ou falhar em silêncio (ver Questões).
- **RGPD — credenciais e token nunca em claro.** `email`/`password` passam no body do login e o token
  na resposta. Nem serviço nem testes podem logar qualquer dos dois, e o token não pode tocar em
  `localStorage`/`sessionStorage`/cookies — custódia exclusiva do `SessaoAtivaStore`, em memória.

## Questões em aberto

1. **Que `apiUrl` fica em `environment.ts`?** — `http://findocprocessor-backend-laravel.test/api`
   (host de Valet, o mesmo que `npm run sync:contract` já usa) ou `http://localhost:8000/api` (o que o
   `openapi.yaml` declara em `servers`)? O sufixo `/api` está confirmado nas rotas do backend; falta
   decidir o host.
2. **`environment.production.ts` + `fileReplacements` entram nesta issue?** — A CA-08 pede o mínimo
   (`environment.ts`), mas o `06-config.md` documenta os três ficheiros e o gate de produção corre em
   CI. Ou se alarga o âmbito agora, ou se assume conscientemente que o build de produção fica a apontar
   para dev até uma issue de configuração.
3. **O que faz o `efetuarAutenticacao()` perante um 200 sem `data.token`?** — Repropagar um erro ao chamador e
   chamar `encerrarSessao()` (tratar como falha, coerente com a CA-04), ou deixar passar sem registar
   sessão? Precisa de decisão explícita para virar CA de spec e teste.
4. **Que forma tem a API pública de `efetuarAutenticacao()`/`terminarSessao()`?** — `Observable` devolvido ao chamador (o
   default do projeto: `HttpClient` para leituras e mutações, sem `resource`/`httpResource`), com os
   efeitos de sessão dentro do stream? Confirma-se este contrato de saída, ficando a subscrição e o
   tratamento de erro de UI a cargo do futuro componente de login?
