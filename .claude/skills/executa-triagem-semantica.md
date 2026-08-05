# Skill: executa-triagem-semantica

Executa uma revisão semântica — nomenclatura, legibilidade/duplicação, conformidade arquitetural —
que nenhuma ferramenta automática (ESLint / `ng build`) cobre, porque exige leitura de intenção, não
sintaxe. Não tem checklist fixo: lê os ficheiros de `docs/system_spec/` relevantes para o tipo de
ficheiro em causa **em tempo real**, para nunca ficar desatualizada quando o spec ganha uma regra nova.

> **Categoria:** executa
> **Usado em:** `/implementa-plano` (`alvo=tarefa-planeada` antes de Implementar; `alvo=codigo` por
> tarefa, antes do checkpoint) · `/planeia-issue` (`alvo=plano`, depois de `escreve-plan`)
> **Produz:** relatório ✅ limpo, informação de contexto (sem correção), ou violações corrigidas

## Contrato

**Input:** `alvo`: `tarefa-planeada` | `codigo` | `plano`

**Output:**

- `tarefa-planeada` / `plano` → nenhuma correção; só informa o contexto de escrita/planeamento
- `codigo` → relatório ✅ limpo, ou lista de violações corrigidas antes do checkpoint

---

## Tabela — tipo de ficheiro → specs a consultar

| Tipo de ficheiro                              | Specs a ler                                                                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Componente (`*.component.ts`)                 | `02-shared/padroes-componentes.md` (Standalone, OnPush, control flow) + `01-features/<slug>.md`       |
| Signal store (`*.store.ts` em `state/`)       | `02-shared/padroes-signals.md` (+ `04-core/sse.md` se envolver SSE)                                   |
| Service (`*.service.ts` em `core/`)           | `04-core/services.md` + `02-shared/envelope-http.md`                                                  |
| Interceptor (`*.interceptor.ts`)              | `04-core/interceptors.md` + `02-shared/envelope-http.md`                                              |
| Token (`*.token.ts` / `InjectionToken`)       | `04-core/tokens.md`                                                                                   |
| Model / enum / tipo (`*.model.ts`, `models/`) | `03-models/00-convencoes-models.md` + `02-shared/contrato-api.md` (contrato é gerado — backend-first) |
| Rota (`*.routes.ts`)                          | `05-routes/*.md` (lazy `loadComponent`)                                                               |
| Teste (`*.spec.ts`)                           | `07-testing.md` (+ o spec do tipo de ficheiro sob teste)                                              |
| Configuração de qualidade (`eslint.config.js`, Prettier) | `06-config.md` (paridade de configuração) + o spec do tipo de ficheiro que a regra visa |
| _(qualquer ficheiro `.ts`)_                   | `02-shared/convencoes-nomenclatura.md` — **sempre**, nomenclatura é transversal                       |

Se um tipo de ficheiro não constar da tabela (categoria nova no repositório), acrescentar uma linha
antes de prosseguir — não inventar regra sem fonte.

**Invariantes transversais** (verificar sempre, qualquer que seja o ficheiro): `standalone: true`,
`ChangeDetectionStrategy.OnPush`, Signals nativos (preferencialmente), SSE só no `SseStore`, sem
`localStorage`/`sessionStorage`, `multipart/form-data` no upload, sem `any`, tipos do contrato vindos
de `src/app/contrato/api.generated.ts` (nunca redefinidos à mão), **ortografia PT-PT (AO90)** — ver seção abaixo.

---

## Ortografia — Português de Portugal, AO90 (grafia atual)

Verificar a grafia AO90 no **texto português que a tarefa escreve ou altera** (linhas novas/modificadas):
comentários e símbolos de domínio no código (`.ts`) **e** documentação (`.md`). **Exceção à regra do
escuteiro:** ao contrário das outras verificações, a AO90 **não** se aplica a legado pré-existente nas linhas
não tocadas — reescrever legado por atacado é tarefa dedicada (ver `02-shared/convencoes-nomenclatura.md`).

- **Norma:** Acordo Ortográfico de 1990, variante europeia. Cair as consoantes mudas (`ct`/`cç`/`pt`/`pç`).
  Formas corretas: `atual`, `atualizar`, `arquitetura`, `objetivo`, `correção`, `ação`, `diretiva`, `ativo`,
  `efetivo`, `exato`, `adotar`, `exceção`, `projeto`, `seleção`, `aspeto`, `ótimo`, `refletir`,
  `diretório`, `deteção`, `injeção`.
- **Exceções PT-PT** (consoante pronunciada — **manter**): `facto`, `contacto`/`contactar`. Na dúvida entre
  variantes facultativas, manter a forma europeia.
- **Não** tocar em: identificadores de framework/contrato (`created_at`, `HttpClient`), nomes próprios,
  URLs, ou nomes de ficheiros/skills já existentes (renomear ficheiros é decisão à parte, não triagem).
- **Comportamento:** em `alvo=codigo`, se a tarefa introduziu texto pré-AO90, corrige esse texto
  **novo/alterado** (igual ao lint) e lista no checkpoint — sem ir atrás de legado nas linhas não tocadas;
  em `alvo=plano`/`tarefa-planeada` apenas assinala.

---

## Comportamento por `alvo`

### `alvo=tarefa-planeada` (leve — antes de "Implementar")

1. Ler o título/descrição da tarefa atual no Plano e inferir que tipo(s) de ficheiro vai criar/alterar
   (ex.: "Criar `DocumentTableComponent`" → Componente).
2. Carregar (`Read`) só os specs correspondentes na tabela.
3. Sem ciclo de correção — o conteúdo lido serve apenas para informar a escrita do código a seguir.
   Não produzir relatório nem pausar.

### `alvo=plano` (usado em `/planeia-issue`, depois de `escreve-plan`)

1. Ler o Plano (`docs/plans/YYYY-MM-DD-<slug>.md`) e extrair os nomes de ficheiros/classes/símbolos
   **previstos** em cada tarefa.
2. Classificar cada nome pelo tipo (sufixo `.component.ts`/`.store.ts`/`.service.ts`/…) e carregar os
   specs correspondentes da tabela.
3. Confrontar os nomes previstos com as regras normativas desses specs (nomenclatura, sufixos,
   localização em `features/`/`core/`/`state/`) — sinalizar nomes já previstos incorretamente no
   próprio Plano, antes de a tarefa ser escrita.
4. Se o Plano prevê consumo de contrato (rotas/models/enums): confirmar que existem em
   `src/app/contrato/api.generated.ts`; se não existirem, sinalizar dependência **backend-first**.
5. Sem correção automática do Plano — reportar ao utilizador e ajustar o Plano só se confirmado.

### `alvo=codigo` (usado em `/implementa-plano`, por tarefa, antes do checkpoint)

1. Listar os ficheiros alterados nesta tarefa (`git status --porcelain` / `git diff --name-only`).
2. Classificar cada ficheiro pelo tipo e carregar (`Read`) os specs correspondentes da tabela — se já
   foram lidos no passo `alvo=tarefa-planeada` desta mesma tarefa, não é necessário reler.
3. Reler os ficheiros alterados **linha a linha** (não é grep mecânico) contra as regras normativas
   ("obrigatório"/"sempre"/"nunca") de cada spec carregado. Aplica-se também a identificadores
   **pré-existentes** no ficheiro tocado (regra do escuteiro) — âmbito estritamente local ao ficheiro
   editado: não propagar a outros ficheiros da mesma feature só por consistência — isso é refactor
   dedicado, issue própria.
4. Se a tarefa criou um componente/store/service novo: confirmar que nasceu na pasta correta
   (`features/<feature>/`, `state/`, `core/services/` ou `core/interceptors/`) e com o sufixo certo.
5. Se limpo → `✅ Triagem semântica limpa`, segue sem pausar.
6. Se houver violações → corrigir diretamente (tratamento igual a lint — correção normal de
   qualidade) e listar o que foi corrigido no checkpoint da tarefa.
7. Em qualquer dos casos, expor no checkpoint da tarefa a linha `Specs lidos nesta tarefa: <lista>`
   com os ficheiros de `docs/system_spec/` efetivamente lidos — um salto de triagem (spec do tipo
   de ficheiro não lido) fica visível na hora.

---

## Regras

- Fonte da verdade é sempre o conteúdo atual do `.md` de spec — nunca assumir a regra de memória/treino.
- Afirmar factos do repo (convenções, setup de testes, contrato) só depois de ler a fonte em
  `docs/system_spec/`; não inferir convenções apenas de ficheiros-irmãos. Perguntar só em ambiguidade
  genuína — não "perguntar sempre".
- Carregamento condicional: só ler os specs dos tipos de ficheiro efetivamente presentes na tarefa/Plano.
- Nunca substitui a leitura humana no checkpoint — é um passo adicional, não um atalho.
- `alvo=tarefa-planeada` e `alvo=plano` nunca corrigem automaticamente — só `alvo=codigo` corrige.
