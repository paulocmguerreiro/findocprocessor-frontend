// ⚠️ FICHEIRO GERADO — não editar à mão.
// Gerado por scripts/gen-models.mjs a partir de api.generated.ts
// (contrato: openapi.yaml do backend Laravel) em 2026-08-07.
// Alterações manuais PERDEM-SE na próxima sincronização: npm run sync:contract
import type { components } from './api.generated';

export type CampoOrdenacaoCategorias = components['schemas']['CampoOrdenacaoCategorias'];
export const CAMPO_ORDENACAO_CATEGORIAS_VALUES = ['nome'] as const satisfies readonly CampoOrdenacaoCategorias[];

export type CampoOrdenacaoDocumentos = components['schemas']['CampoOrdenacaoDocumentos'];
export const CAMPO_ORDENACAO_DOCUMENTOS_VALUES = ['data_documento', 'created_at'] as const satisfies readonly CampoOrdenacaoDocumentos[];

export type CampoOrdenacaoEntidades = components['schemas']['CampoOrdenacaoEntidades'];
export const CAMPO_ORDENACAO_ENTIDADES_VALUES = ['nome'] as const satisfies readonly CampoOrdenacaoEntidades[];

export type CampoOrdenacaoRoles = components['schemas']['CampoOrdenacaoRoles'];
export const CAMPO_ORDENACAO_ROLES_VALUES = ['name'] as const satisfies readonly CampoOrdenacaoRoles[];

export type CampoOrdenacaoTiposDocumento = components['schemas']['CampoOrdenacaoTiposDocumento'];
export const CAMPO_ORDENACAO_TIPOS_DOCUMENTO_VALUES = ['nome'] as const satisfies readonly CampoOrdenacaoTiposDocumento[];

export type CampoOrdenacaoUtilizadores = components['schemas']['CampoOrdenacaoUtilizadores'];
export const CAMPO_ORDENACAO_UTILIZADORES_VALUES = ['name', 'email', 'created_at'] as const satisfies readonly CampoOrdenacaoUtilizadores[];

export type DirecaoOrdenacao = components['schemas']['DirecaoOrdenacao'];
export const DIRECAO_ORDENACAO_VALUES = ['asc', 'desc'] as const satisfies readonly DirecaoOrdenacao[];

export type EstadoDocumento = components['schemas']['EstadoDocumento'];
export const ESTADO_DOCUMENTO_VALUES = ['PENDENTE', 'ANALISE_MALWARE', 'ANALISE_TEXTO', 'ANALISE_OCR', 'ANALISE_IA_LOCAL', 'ANALISE_CLOUD', 'PROCESSADO', 'ERRO', 'PERIGOSO'] as const satisfies readonly EstadoDocumento[];

export type FiltroEstadoRegisto = components['schemas']['FiltroEstadoRegisto'];
export const FILTRO_ESTADO_REGISTO_VALUES = ['todos', 'somente_ativos', 'somente_inativos'] as const satisfies readonly FiltroEstadoRegisto[];

export type ModoReprocessamento = components['schemas']['ModoReprocessamento'];
export const MODO_REPROCESSAMENTO_VALUES = ['MODELO', 'FERRAMENTA'] as const satisfies readonly ModoReprocessamento[];

export type Permissao = components['schemas']['Permissao'];
export const PERMISSAO_VALUES = ['categorias-documento.ver', 'categorias-documento.criar', 'categorias-documento.atualizar', 'categorias-documento.eliminar', 'documentos.ver', 'documentos.criar', 'documentos.atualizar', 'documentos.eliminar', 'entidades.ver', 'entidades.criar', 'entidades.atualizar', 'entidades.eliminar', 'entidades.agrupar', 'roles.ver', 'roles.criar', 'roles.atualizar', 'roles.eliminar', 'tipos-documento.ver', 'tipos-documento.criar', 'tipos-documento.atualizar', 'tipos-documento.eliminar', 'utilizadores.ver', 'utilizadores.criar', 'utilizadores.atualizar', 'utilizadores.eliminar', 'utilizadores.anonimizar', 'utilizadores.atribuir-role'] as const satisfies readonly Permissao[];

export type PosicaoEmpresaMae = components['schemas']['PosicaoEmpresaMae'];
export const POSICAO_EMPRESA_MAE_VALUES = ['fornecedor', 'cliente'] as const satisfies readonly PosicaoEmpresaMae[];

export type ResultadoEtapa = components['schemas']['ResultadoEtapa'];
export const RESULTADO_ETAPA_VALUES = ['SUCESSO', 'FALHA', 'EM_CURSO'] as const satisfies readonly ResultadoEtapa[];

export type TipoMovimento = components['schemas']['TipoMovimento'];
export const TIPO_MOVIMENTO_VALUES = ['debito', 'credito', 'neutro'] as const satisfies readonly TipoMovimento[];

