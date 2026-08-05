# Core — Sessão ativa

O `SessaoAtivaStore` (`src/app/state/sessao-ativa.store.ts`) guarda o bearer token da sessão. É a
única entidade da aplicação que responde a "há alguém autenticado?".

É **só custódia de estado**: não faz HTTP, não injeta nada e não decide nada sobre o token.

## Invariantes

> **O token vive só em memória.** Sem `localStorage`, `sessionStorage`, cookies ou `TransferState`.
> Um refresh perde a sessão, por desenho (RGPD — nenhum dado sensível persiste no browser).

> **O token só é lido em `src/app/core/interceptors/**`.** Garantido pelo `ng lint` — ver
> "Restrição de leitura" abaixo.

## API pública

| Símbolo | Tipo | Papel |
| ------- | ---- | ----- |
| `tokenParaAutorizacao` | `Signal<string \| null>` | Leitura readonly do token, via `asReadonly()` sobre o signal privado. **Nome não-renomeável** — ver abaixo |
| `estaAutenticado` | `Signal<boolean>` | Derivado (`computed()`) da presença de token. Sem signal próprio |
| `registarSessao(token: string)` | método | Regista o token. Sobrepõe um token anterior sem exigir `encerrarSessao` — é a operação de renovação de sessão |
| `encerrarSessao()` | método | Repõe o estado a "sem sessão". Seguro quando não há sessão ativa |

O estado interno é um único campo privado nativo (`#token`), privado também em runtime e não apenas
para o TypeScript.

## Regras de comportamento

- Autenticado **se e só se** existe token. Nenhuma validação de forma, comprimento, prefixo ou
  expiração — validar o token é do backend.
- **O store não rejeita string vazia.** Registar `''` deixa a aplicação em estado autenticado com uma
  credencial inútil. É decisão consciente: não registar o que não se recebeu é responsabilidade de
  quem chama. Fixado por teste, para não ser "corrigido" por engano.

## Fronteira — quem desembrulha o token

O store recebe sempre uma `string` já resolvida. No contrato, `Token` é `{ data?: { token?: string } }`,
ou seja o valor útil é `string | undefined`: **desembrulhar e confirmar que existe é de quem faz o
HTTP** (o futuro serviço de autenticação), nunca do store. Se o `undefined` escorregasse para o
estado, `estaAutenticado` passaria a ter três valores em vez de dois.

## Restrição de leitura (regra ESLint)

`eslint.config.js` tem uma regra `no-restricted-syntax` com o seletor
`MemberExpression[property.name="tokenParaAutorizacao"]`, desativada num bloco posterior para
`src/app/core/interceptors/**/*.ts` e para o ficheiro de teste do próprio store. Qualquer outra
leitura do token faz `ng lint` — e portanto o CI — falhar.

- **Porque é que o nome não se renomeia:** o nome *é* a âncora do seletor. Renomeá-lo desliga a
  proteção **em silêncio** — o lint continua verde e a barreira deixa de existir. Daí o comentário
  "NÃO RENOMEAR" no código, adjacente à declaração.
- **Porquê este nome e não `.token`:** ancorar em `.token` colidiria com o desembrulhar de
  `Token['data']['token']` no serviço de autenticação; ancorar no nome da variável de injeção falharia
  em silêncio à primeira mudança de nome.
- **A exceção é dada a ficheiros concretos**, não a `**/*.spec.ts` — uma exceção a todos os testes
  deixaria qualquer spec ler o token e tornaria a regra decorativa.
- **Alcance real:** é uma barreira de *análise estática*. Cai perante um `eslint-disable` e não vê
  código que não passe pelo lint. Serve para que a leitura indevida rebente o CI e fique visível em
  revisão — não para a impedir. Restrição efetiva em runtime exigiria type-aware linting ou inverter
  o desenho (o store nunca expor o token e ser ele a anexar o header).

## Fora de âmbito (por implementar)

O serviço de autenticação (`POST /auth/login` → `registarSessao`), o interceptor que lê o token para o
header `Authorization`, e o serviço de perfil/permissões (`GET /auth/me` — **não existe no contrato**;
é dependência backend-first). Nada na aplicação consome este store ainda.
