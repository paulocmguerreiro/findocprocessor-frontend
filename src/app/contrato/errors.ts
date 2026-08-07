// ⚠️ FICHEIRO GERADO — não editar à mão.
// Gerado por scripts/gen-models.mjs a partir de api.generated.ts
// (contrato: openapi.yaml do backend Laravel) em 2026-08-07.
// Alterações manuais PERDEM-SE na próxima sincronização: npm run sync:contract
import type { components } from './api.generated';

export type ErrorAgrupamentoInvalido = components['schemas']['ErrorAgrupamentoInvalido'];
export type ErrorDemasiadosPedidos = components['schemas']['ErrorDemasiadosPedidos'];
export type ErrorDocumentoDuplicado = components['schemas']['ErrorDocumentoDuplicado'];
export type ErrorNaoAutenticado = components['schemas']['ErrorNaoAutenticado'];
export type ErrorNaoEncontrado = components['schemas']['ErrorNaoEncontrado'];
export type ErrorSemPermissao = components['schemas']['ErrorSemPermissao'];
export type ErrorTransicaoInvalida = components['schemas']['ErrorTransicaoInvalida'];
export type ErrorValidacao = components['schemas']['ErrorValidacao'];

/** União de todos os envelopes de erro da API. */
export type ApiError =
  | ErrorAgrupamentoInvalido
  | ErrorDemasiadosPedidos
  | ErrorDocumentoDuplicado
  | ErrorNaoAutenticado
  | ErrorNaoEncontrado
  | ErrorSemPermissao
  | ErrorTransicaoInvalida
  | ErrorValidacao;
