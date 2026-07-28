# Convenções de Nomenclatura

Código de domínio em **Português de Portugal**; inglês apenas onde o framework ou o contrato da API o impõem.

## Português vs. Inglês

| Contexto | Idioma | Exemplo |
| --- | --- | --- |
| Símbolos de domínio (métodos, signals, variáveis) | PT | `estadoAtual`, `filtrarPorEstado()`, `contagemPorEstado` |
| Enums de domínio (valores do contrato) | conforme contrato | `EstadoDocumento.PROCESSADO` |
| APIs do framework | EN (imposto) | `ngOnInit`, `HttpClient`, `inject`, `computed` |
| Campos do contrato (do backend) | conforme `openapi.yaml` | `created_at`, `nome_ficheiro_original`, `id_categoria` |

> Nota: os campos do contrato usam `snake_case` PT (vindos do Laravel). Não renomear — são a fonte de verdade. Mapeamentos ergonómicos, se necessários, vivem em view-models locais, nunca alterando o tipo gerado.

### Grafia — Acordo Ortográfico de 1990 (AO90)

O Português de Portugal do projeto segue a grafia AO90 (norma em vigor): `projeto`, `ação`, `correção`,
`atualizar`, `diretamente`, `exceção`, `coleção` — nunca as formas pré-AO90 (`projecto`/`acção`/`correcção`)
nem grafias do Português do Brasil. Aplica-se a toda a escrita em português: identificadores de domínio,
comentários, documentação, Briefs, Debriefs, Changelog e mensagens de commit/PR. Manter as formas em que
a variante europeia **conserva** a consoante pronunciada (`facto`, `contacto`/`contactar`).

**Migração do legado:** o texto e os identificadores existentes já foram migrados para AO90. Exceção:
`src/app/contrato/api.generated.ts` (gerado — a grafia das descrições vem do `openapi.yaml` do backend;
corrige-se **aí**, não aqui). Em texto/código novo, aplicar AO90 desde já; a migração de legado por
atacado é tarefa dedicada — **não** se faz pela regra do escuteiro.

## Sufixos e ficheiros

| Artefacto | Símbolo | Ficheiro |
| --- | --- | --- |
| Componente | `PascalCase` + `Component` | `<nome>.component.ts` |
| Signal store | `PascalCase` + `Store` | `<nome>.store.ts` |
| Service | `PascalCase` + `Service` | `<nome>.service.ts` |
| Interceptor | `camelCase` + `Interceptor` (função) | `<nome>.interceptor.ts` |
| Token | `SCREAMING_SNAKE` ou `PascalCase` | `<nome>.token.ts` |
| Model/enum interno | `PascalCase` | `<nome>.model.ts` |
| Rotas | — | `<feature>.routes.ts` / `app.routes.ts` |

## Regras

- Métodos em VERBO+Intenção (`carregarDocumentos`, `marcarComoLido`).
- Signals/variáveis em NOME+Intenção (`documentosFiltrados`, `estaACarregar`).
- **Escala/unidade opcional** no fim quando clarifica o valor (Substantivo+Intenção+Escala):
  `duracaoExecucaoEmSegundos`, `tamanhoMaximoEmBytes`, `intervaloSondagemEmMs`, `percentagemConclusao`.
  Omitir quando a unidade é óbvia ou irrelevante — é uma ajuda de legibilidade, não uma obrigação.
- Seletores de componentes com prefixo do projeto (ver `angular.json`).
- Ficheiros em `kebab-case`.
