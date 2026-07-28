// ⚠️ FICHEIRO GERADO — não editar à mão.
// Gerado por scripts/gen-models.mjs a partir de api.generated.ts
// (contrato: openapi.yaml do backend Laravel) em 2026-07-28.
// Alterações manuais PERDEM-SE na próxima sincronização: npm run sync:contract
import type { components } from './api.generated';

export type ErrorValidacao = components['schemas']['ErrorValidacao'];
export type ErrorNaoAutenticado = components['schemas']['ErrorNaoAutenticado'];
export type ErrorNaoEncontrado = components['schemas']['ErrorNaoEncontrado'];
export type ErrorSemPermissao = components['schemas']['ErrorSemPermissao'];
export type ErrorTransicaoInvalida = components['schemas']['ErrorTransicaoInvalida'];

/** União de todos os envelopes de erro da API. */
export type ApiError =
  | ErrorValidacao
  | ErrorNaoAutenticado
  | ErrorNaoEncontrado
  | ErrorSemPermissao
  | ErrorTransicaoInvalida;
