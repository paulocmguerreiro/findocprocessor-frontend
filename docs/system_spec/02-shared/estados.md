# Ciclo de Estados do Documento (read-only no frontend)

O estado do documento (`EstadoDocumento`) é decidido e transitado **exclusivamente pelo backend**. O
frontend **reflete** o estado — nunca o decide, nunca calcula transições. É a máquina de estados do
pipeline de processamento, espelhada aqui só para orientar a UI (badges, filtros, gráficos).

## Máquina de estados

```
PENDENTE → ANALISE_MALWARE → ANALISE_TEXTO → ANALISE_IA_LOCAL → PROCESSADO
                                   ↘ ANALISE_OCR ↗   ↘ ANALISE_CLOUD ↗
            (qualquer etapa de análise) ↘ ERRO ↘ PERIGOSO
```

Valores (do contrato, `EstadoDocumento`): `PENDENTE`, `ANALISE_MALWARE`, `ANALISE_TEXTO`, `ANALISE_OCR`,
`ANALISE_IA_LOCAL`, `ANALISE_CLOUD`, `PROCESSADO`, `ERRO`, `PERIGOSO`.

- Ramos opcionais: `ANALISE_TEXTO → ANALISE_OCR` (falta texto nativo); `ANALISE_IA_LOCAL → ANALISE_CLOUD` (escala para cloud).
- `ERRO → PENDENTE` reabre o pipeline (reprocessamento, via endpoint do backend).
- `PROCESSADO → PROCESSADO` é self-loop de correção.
- `PERIGOSO` é terminal.

## Implicações no frontend

- A lista de estados para iteração/badges vive em `ESTADO_DOCUMENTO_VALUES` (gerado em `enums.ts`, via ficheiro-índice `src/app/contrato`), alinhada com o contrato.
- A UI **não** oferece ações que impliquem transições que o backend não expõe como endpoint. Reprocessar/corrigir são chamadas à API; o novo estado vem na resposta ou via SSE.
- `EtapaDocumento.historico` (com `resultado: SUCESSO|FALHA|EM_CURSO`) alimenta o Activity Log / timeline.

> A autoridade e o mapa completo de transições vivem no backend
> (`findocprocessor-backend-laravel/docs/system_spec/02-shared/estados.md`).
