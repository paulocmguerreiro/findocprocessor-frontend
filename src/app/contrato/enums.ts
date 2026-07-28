// ⚠️ FICHEIRO GERADO — não editar à mão.
// Gerado por scripts/gen-models.mjs a partir de api.generated.ts
// (contrato: openapi.yaml do backend Laravel) em 2026-07-28.
// Alterações manuais PERDEM-SE na próxima sincronização: npm run sync:contract
import type { components } from './api.generated';

export type FiltroEstadoRegisto = components['schemas']['FiltroEstadoRegisto'];
export const FILTRO_ESTADO_REGISTO_VALUES = ['todos', 'somente_ativos', 'somente_inativos'] as const satisfies readonly FiltroEstadoRegisto[];

export type EstadoDocumento = components['schemas']['EstadoDocumento'];
export const ESTADO_DOCUMENTO_VALUES = ['PENDENTE', 'ANALISE_MALWARE', 'ANALISE_TEXTO', 'ANALISE_OCR', 'ANALISE_IA_LOCAL', 'ANALISE_CLOUD', 'PROCESSADO', 'ERRO', 'PERIGOSO'] as const satisfies readonly EstadoDocumento[];

export type ResultadoEtapa = components['schemas']['ResultadoEtapa'];
export const RESULTADO_ETAPA_VALUES = ['SUCESSO', 'FALHA', 'EM_CURSO'] as const satisfies readonly ResultadoEtapa[];

