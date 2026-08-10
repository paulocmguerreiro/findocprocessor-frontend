# Contrato da API — backend-first

## Fonte de verdade única

O contrato (rotas, resources/models, enums, envelope de resposta) tem **uma** fonte de verdade:
`openapi.yaml` do backend Laravel (`findocprocessor-backend-laravel`, OpenAPI 3.1, servido em
`/openapi.yaml` em não-produção).

**O Angular nunca inventa contrato — só o consome.** Se o frontend precisa de rota/model/enum/envelope
novo, prepara-se **primeiro** no backend; só depois se sincroniza aqui.

> Esta sincronização é de **dados/tipos**, não do workflow. Nada a ver com o antigo sync de
> commands/skills (banido).

## Mecânica de sincronização

```bash
npm run sync:contract          # openapi-typescript http://findocprocessor-backend-laravel.test/openapi.yaml → src/app/contrato/api.generated.ts (Valet, preferencial)
npm run sync:contract:github   # idem, a partir de raw.githubusercontent.com/.../main/openapi.yaml (fallback, backend não a correr)
```

- `src/app/contrato/api.generated.ts` — **gerado** por `openapi-typescript` (corrido por `npx`, sem devDep — evita conflito de peer com TS 6). Não editar à mão.
- Camada **por recurso**, gerada por `scripts/gen-models.mjs` (corre logo a seguir, no mesmo `npm run sync:contract`): um `<recurso>.model.ts` por recurso, `enums.ts` (tipos + listas de runtime `*_VALUES`), `errors.ts` (união `ApiError`) e o ficheiro-índice `index.ts` (ponto de importação estável). Cada ficheiro tem cabeçalho de aviso.
- **Tudo em `src/app/contrato/` é gerado — não editar à mão.** Modelos escritos à mão (só-Angular) nunca vivem aqui: os partilhados vão para `src/app/models/`, os específicos de uma feature ficam na própria feature.
- **Drift:** as listas de runtime em `enums.ts` trazem um check de exaustividade (`satisfies`) que o `tsc` valida contra o contrato; como valores e tipos saem da mesma sincronização, ficam sempre alinhados.
- Skill `sincroniza-contrato` orquestra: regenerar → `git diff` → `tsc` → atualizar este ficheiro.

## Origem do contrato — por URL web (nunca ficheiro local)

O `openapi.yaml` é obtido **sempre por URL**, nunca por caminho de ficheiro no disco:

| Fonte | Comando | Quando |
| --- | --- | --- |
| Valet local (preferencial) | `npm run sync:contract` | `http://findocprocessor-backend-laravel.test/openapi.yaml` — versão mais atualizada |
| GitHub raw (fallback) | `npm run sync:contract:github` | `https://raw.githubusercontent.com/paulocmguerreiro/findocprocessor-backend-laravel/main/openapi.yaml` — quando o backend não corre localmente |

- **Nunca** usar o URL `.../blob/...` do GitHub (é HTML — o `openapi-typescript` não o parseia). Só o **raw** (`raw.githubusercontent.com`).
- **Nunca** voltar ao caminho sibling (`../findocprocessor-backend-laravel/openapi.yaml`): expõe a estrutura de pastas local no `package.json`/docs versionados e obriga a um layout de disco fixo. Os URLs não revelam a máquina e correm em qualquer clone.

## Recursos atualmente no contrato

Schemas: `Documento` (+ `EtapaDocumento`, historico), `CategoriaDocumento`, `TipoDocumento`, `Entidade`,
`Role`, `Utilizador`, `Token`. Envelopes de sucesso nomeados (um por recurso, `{ data: T }`):
`EnvelopeToken`, `EnvelopeDocumento`, `EnvelopeDocumentoComRelacoes`, `EnvelopeEntidade`,
`EnvelopeCategoriaDocumento`, `EnvelopeTipoDocumento`, `EnvelopeTipoDocumentoComRelacoes`,
`EnvelopeRole`, `EnvelopeUtilizador`. Envelopes paginados (`{ data: T[], links, meta }`):
`EnvelopePaginadoDocumento`, `EnvelopePaginadoEntidade`, `EnvelopePaginadoCategoriaDocumento`,
`EnvelopePaginadoTipoDocumento`, `EnvelopePaginadoRole`, `EnvelopePaginadoUtilizador` — com
`LinksPaginacao`/`MetaPaginacao` partilhados. Pedidos (request DTOs): `PedidoAutenticacao`, `PedidoCriarToken`,
`PedidoCriarCategoria`/`PedidoAtualizarCategoria`, `PedidoCriarTipoDocumento`/`PedidoAtualizarTipoDocumento`,
`PedidoCriarEntidade`/`PedidoAtualizarEntidade`, `PedidoCriarRole`/`PedidoAtualizarRole`,
`PedidoCriarUtilizador`/`PedidoAtualizarUtilizador`/`PedidoAtribuirRole`,
`PedidoCriarDocumentoManual`/`PedidoUploadDocumento`/`PedidoCorrigirDocumento`/`PedidoReprocessarDocumento`.
Enums: `EstadoDocumento`, `ResultadoEtapa`, `FiltroEstadoRegisto`, `ModoReprocessamento`, `Permissao`,
`PosicaoEmpresaMae`, `TipoMovimento`, `DirecaoOrdenacao` + `CampoOrdenacao{Categorias,Documentos,Entidades,Roles,TiposDocumento,Utilizadores}`
(ordenação por listagem, um enum por recurso). Envelope de erro: `ErrorValidacao`, `ErrorNaoAutenticado`,
`ErrorNaoEncontrado`, `ErrorSemPermissao`, `ErrorTransicaoInvalida`, `ErrorAgrupamentoInvalido`,
`ErrorDemasiadosPedidos`, `ErrorDocumentoDuplicado`. Rotas: auth (login/logout/criarToken),
categorias-documento, tipos-documento, entidades (+ agruparCom/converterEmEmpresaMae/restaurar), roles,
documentos (+ upload, reprocessar, descarregar), utilizadores (+ anonimizar, restaurar, atribuirRole).

> Valores e campos exatos: `src/app/contrato/api.generated.ts` (fonte). Não duplicar aqui — este ficheiro
> regista **o que existe para consumir** e a data do último sync, não o corpo dos tipos.

**Último sync:** 2026-08-10 (via `sync:contract`, Valet — confirmado sem drift face ao ficheiro que
originou a sincronização, obtido primeiro localmente para desbloquear a issue #12 antes do merge do
backend; o comando canónico foi corrido depois e reproduziu exatamente o mesmo resultado, `tsc --noEmit`
limpo). ⚠️ **A branch do backend que introduziu este delta
(`refactor/openapi-envelopes-reutilizados`) ainda não estava publicada/mergeada em `main` nesta data** —
um sync futuro via `sync:contract:github` (fallback, `main`) só reproduz este estado depois desse merge.
Drift desta sincronização: envelope de sucesso (`{ data: T }`, antes inline em cada operação) e envelope
paginado (`{ data: T[], links, meta }` + query params de listagem `per_page`/`sort`/`direction`/`cursor`,
antes repetidos idênticos em cada `*.index`) promovidos a schemas nomeados — ver "Recursos atualmente no
contrato" acima. Sem impacto no código consumidor além do que já usava a forma inline (`tsc --noEmit`
limpo).

**Sync anterior:** 2026-08-07 (via `sync:contract:github` — Valet local indisponível). `operations`
passou a ter chaves nomeadas por `operationId` (ex.: `operations["auth.login"]`, antes anónimas por
path); parâmetros de rota `{id}` renomeados para o nome do recurso (ex.: `{categorias_documento}`,
`{entidade}`, `{role}`, `{tipos_documento}`, `{utilizador}`). Adições: 16 novos `Pedido*` (request DTOs,
antes ausentes do contrato), 8 novos enums de ordenação/domínio, 3 novos envelopes de erro
(`ErrorAgrupamentoInvalido`, `ErrorDemasiadosPedidos`, `ErrorDocumentoDuplicado`).

## Regras
- Importar sempre do ficheiro-índice `src/app/contrato` (`index.ts`), nunca do gerado diretamente.
- Estado do documento é **read-only** no frontend — ver `estados.md`.
- Contrato em falta → dependência backend-first; parar e sinalizar, nunca inventar tipos.
