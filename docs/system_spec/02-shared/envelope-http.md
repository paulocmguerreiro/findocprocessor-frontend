# Envelope de Resposta & Tratamento de Erros

## Envelope

O contrato do backend define o envelope de erro (ver `contrato-api.md`). Os tipos vêm do ficheiro-índice `src/app/contrato` (`index.ts`):

- Sucesso: o payload tipado do recurso (ex: `Documento`, `Documento[]`).
- Erro: união `ApiError` — cada variante tem `status` (número) e `detail` (string); `ErrorValidacao`
  acrescenta `errors` (mapa campo → mensagens).

Variantes: `ErrorValidacao` (422), `ErrorNaoAutenticado` (401), `ErrorNaoEncontrado` (404),
`ErrorSemPermissao` (403), `ErrorTransicaoInvalida` (422 — transição de estado inválida).

## `ErrorInterceptor` (global)

Interceptor funcional registado via `provideHttpClient(withInterceptors([errorInterceptor]))`.

Responsabilidades:
- **409** (conflito) → toast (regra do projeto). Não propagar detalhe cru ao componente.
- Mapear respostas de erro para `ApiError` tipado.
- Erros de rede/5xx → toast genérico + rethrow para o chamador tratar quando aplicável.
- Nunca logar dados pessoais em claro (RGPD/NIS2).

> Detalhe do interceptor: `04-core/interceptors.md`.

## Regras
- Componentes não fazem tratamento global de erro — confiam no interceptor + no estado de erro do store.
- Mensagens ao utilizador vêm do `detail` do envelope (PT), não de strings hardcoded quando o backend as fornece.
