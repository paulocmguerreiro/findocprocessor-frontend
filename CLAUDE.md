# FinDocProcessor — Frontend Angular

## STACK_CONFIG

```
STACK:        angular
GITHUB_REPO:  paulocmguerreiro/findocprocessor-frontend
TEST_RUNNER:  ng test --watch=false
TEST_PATTERN: **/*.spec.ts
```

---

## ARQUITETURA

**Abordagem:** Standalone components (sem NgModule), Features por domínio, Signals nativos (abordagem por omissão para estado; NgRx/RxJS quando acrescentam valor), zoneless change detection, OnPush.

### Estrutura de features

```
src/app/features/<feature>/
  <feature>.component.ts    (standalone; sem template/estilos inline)
  <feature>.component.html  (template — SEMPRE em ficheiro à parte)
  <feature>.component.scss  (estilos — SEMPRE em ficheiro à parte)
  <feature>.routes.ts       (lazy loaded, quando > 1 rota)
```

Camadas: `contrato (tipos gerados do backend) → core (services/interceptors/tokens) → state (signal stores) → features (componentes/rotas)`.
> **`contrato/` vs `models/`:** `src/app/contrato/` é **100% gerado** do `openapi.yaml` (não editar — ver "CONTRATO DA API"). `src/app/models/` é para **modelos escritos à mão que só existem no Angular** (view-models partilhados, tipos de UI de domínio próprio) — compõem os tipos do contrato, nunca os substituem. View-models específicos de uma feature ficam na feature.
> Detalhe: `docs/system_spec/02-shared/contratos-por-camada.md` · `docs/system_spec/02-shared/estrutura-subpastas-features.md`

### Padrões obrigatórios

- **Standalone é o default (Angular v20+)** — **não** escrever `standalone: true`. Nunca reintroduzir `NgModule`.
- **OnPush é o default (Angular v22+)** — **não** escrever `changeDetection: ChangeDetectionStrategy.OnPush`. Nunca reverter para `Default`.
  > Nota: o objetivo continua a ser "tudo standalone + OnPush" — em v22 isso é garantido pelos defaults, por isso escrevê-los explicitamente é redundante e desaconselhado pelo MCP `angular`.
- Signals nativos (`signal`/`computed`/`update`/`set`, nunca `mutate`) como default para estado. **NgRx/RxJS não são proibidos** — usar quando fazem sentido (streams, operadores como `debounceTime`/`takeUntilDestroyed`, efeitos); interop via `toSignal()`/`toObservable()`, é esperado converter entre os dois.
- HTTP via `HttpClient` para **leituras e mutações** (GET/POST/PUT/DELETE) — **não** usar `httpResource`/`resource` neste projeto. Estado partilhado só em signal stores.
- `input()` / `output()` (funções) e `inject()` — nunca decorators de input/output nem injeção por construtor.
- Host bindings no objeto `host` do decorator — nunca `@HostBinding`/`@HostListener`.
- Control flow nativo (`@if`/`@for` com `track`/`@switch`) — nunca `*ngIf`/`*ngFor`; `class`/`style` bindings — nunca `ngClass`/`ngStyle`.
- Template e estilos **SEMPRE em ficheiros separados** (`.component.html` + `.component.scss`) — **nunca** `template:`/`styles:`/`styleUrls` inline.
- `SseStore` como singleton — **SSE nunca subscrito em componentes**.
  > Detalhe: `docs/system_spec/04-core/sse.md`
- `InjectionToken<string>` para `API_URL`.
  > Detalhe: `docs/system_spec/04-core/tokens.md`
- `multipart/form-data` para upload — nunca base64 em JSON.
- Lazy loading via `loadComponent()` em `app.routes.ts`.
- TypeScript strict mode; **sem `any`** (`unknown` quando incerto).
- Signal Forms (`@angular/forms/signals`, estável em v22) para forms novos; senão, Reactive Forms tipados.
- Acessibilidade: passar AXE, cumprir WCAG AA.

### O que NÃO fazer

- Não usar `NgModule` nem escrever `standalone: true`/`OnPush` explícitos.
- Não subscrever SSE diretamente em componentes.
- Não usar `localStorage` ou `sessionStorage`.
- Não usar `any`; não desativar strict mode.
- **Não inventar rotas/models/enums/envelope** — o contrato é backend-first (ver seção "CONTRATO DA API").

### Rotas da aplicação

_Nenhuma rota implementada ainda._ As rotas são documentadas (em `docs/system_spec/05-routes/`) **à medida
que forem implementadas** — não se antecipam no spec. Padrão a seguir quando existirem: lazy via
`loadComponent()` em `app.routes.ts`.

### Segurança e conformidade

- Nenhum dado sensível em `localStorage`/`sessionStorage`.
- Upload sempre `multipart/form-data`.
- Erros 409 intercetados globalmente → toast.
  > Detalhe: `docs/system_spec/02-shared/envelope-http.md`

---

## CONVENÇÕES DE NOMENCLATURA

Código de domínio em **Português de Portugal** (símbolos, variáveis, enums de domínio); inglês apenas
onde o framework/contrato impõe o nome (`ngOnInit`, `HttpClient`, campos do contrato como `created_at`).
Componentes em `PascalCase` + sufixo `Component`; signal stores em `PascalCase` + `Store`; services em
`PascalCase` + `Service`; ficheiros em `kebab-case` com sufixo (`.component.ts`, `.store.ts`, `.service.ts`,
`.interceptor.ts`, `.model.ts`, `.routes.ts`). Métodos em VERBO+Intenção, signals/variáveis em NOME+Intenção.
Escala/unidade **opcional** no fim quando clarifica (Substantivo+Intenção+Escala): `duracaoExecucaoEmSegundos`,
`tamanhoMaximoEmBytes`, `intervaloSondagemEmMs`.
Toda a escrita em português — identificadores de domínio, comentários, documentação, Changelog e mensagens
de commit/PR — segue a **grafia AO90** (norma em vigor: `projeto`, `ação`, `atualizar`), nunca formas
pré-AO90 nem do Português do Brasil.

> Detalhe: `docs/system_spec/02-shared/convencoes-nomenclatura.md`

---

## CONVENÇÕES DE DOCUMENTAÇÃO

- **Todos os docs** (`docs/`, `.claude/`, `README.md`, `CHANGELOG.md`, este `CLAUDE.md`) em **Português de Portugal**.
- **Grafia AO90** em todo o português — regra e migração de legado em `CONVENÇÕES DE NOMENCLATURA` e
  `docs/system_spec/02-shared/convencoes-nomenclatura.md`; validação na skill `executa-triagem-semantica`.
- Mantidos **alinhados com as normas mais atuais** do Angular v22 (o idioma da versão instalada). Na dúvida
  sobre uma API/sintaxe, confirmar via MCP `angular` (`get_best_practices` / `search_documentation`) **antes**
  de escrever — nunca fixar API desatualizada nos docs.
- Refletir só o que **existe**: não documentar rotas/features/serviços ainda não implementados (marcam-se
  quando forem construídos, via `atualiza-spec`).

---

## CONVENÇÕES DE TIPAGEM

Strict mode sempre; eliminar `any` (usar `unknown` quando o tipo é incerto e refinar). **Os tipos de
dados da API vêm do contrato gerado** e são importados do ficheiro-índice `src/app/contrato` (`index.ts`) —
nunca redefinir manualmente um model/enum/envelope que existe no contrato. Preferir inferência quando
o tipo é óbvio.

> Detalhe: `docs/system_spec/03-models/00-convencoes-models.md`

---

## CONTRATO DA API — backend-first (fonte de verdade única)

O contrato (rotas, resources/models, enums, envelope de resposta) tem **uma** fonte de verdade: o
`openapi.yaml` do **backend Laravel** (`findocprocessor-backend-laravel`). O Angular **nunca** inventa
contrato — só o consome. Se o frontend precisa de algo novo, prepara-se **primeiro** no backend.

Passagem facilitada dos tipos para o frontend:

```bash
npm run sync:contract          # preferencial: Valet http://findocprocessor-backend-laravel.test/openapi.yaml
npm run sync:contract:github   # fallback: raw.githubusercontent.com/.../main/openapi.yaml (backend não a correr localmente)
```

O comando regenera **duas** coisas: `api.generated.ts` (via `openapi-typescript`) e, por cima,
`scripts/gen-models.mjs` emite a camada de tipos **por recurso** — um `*.model.ts` por recurso, mais
`enums.ts`, `errors.ts` e o ficheiro-índice `index.ts` (ponto de importação estável). **Tudo em `src/app/contrato/`
é gerado — não editar à mão** (cada ficheiro tem cabeçalho de aviso). As listas de runtime em `enums.ts`
trazem um check de exaustividade que o `tsc` valida contra o contrato. Skill `sincroniza-contrato`
orquestra a regeneração + deteção de drift.

> Detalhe: `docs/system_spec/02-shared/contrato-api.md`

### Ciclo de estados do documento (read-only no frontend)

Espelha o backend (`EstadoDocumento`), **read-only** — o frontend nunca decide transições, apenas as reflete:

```
PENDENTE → ANALISE_MALWARE → ANALISE_TEXTO → ANALISE_IA_LOCAL → PROCESSADO
                                   ↘ ANALISE_OCR ↗   ↘ ANALISE_CLOUD ↗
            (qualquer etapa) ↘ ERRO ↘ PERIGOSO
```

> Detalhe: `docs/system_spec/02-shared/estados.md`

---

## SYSTEM_SPEC_MAP

> Entrada: ler sempre `docs/system_spec/00-index.md` para descoberta. Depois abrir apenas o ficheiro indicado.
>
> **Ficheiro novo → atualizar sempre `00-index.md`.** Sempre que se cria um ficheiro novo em
> `docs/system_spec/` (nova feature, novo core, novo enum/tipo em ficheiro próprio, nova rota), o
> `00-index.md` é obrigatoriamente atualizado com uma linha na tabela correta.

| Tipo de alteração                              | Ficheiro system_spec a atualizar                        |
| ---------------------------------------------- | -------------------------------------------------------- |
| Novo componente numa feature existente         | `01-features/<slug>.md`                                  |
| Nova feature                                   | criar `01-features/<slug>.md` + atualizar `00-index.md` |
| Novo signal store ou signal partilhado         | `02-shared/padroes-signals.md` (padrão) + `01-features/<slug>.md` |
| Novo service HTTP                              | `04-core/services.md`                                    |
| Novo interceptor                               | `04-core/interceptors.md`                                |
| Novo `InjectionToken`                          | `04-core/tokens.md`                                      |
| SSE (store/serviço)                            | `04-core/sse.md`                                         |
| Novo model/interface/enum interno              | `03-models/<slug>.md`                                    |
| Consumo de contrato novo (rotas/schemas/enums) | `02-shared/contrato-api.md` (via `sincroniza-contrato`)  |
| Envelope de resposta / handler de erro         | `02-shared/envelope-http.md`                             |
| Ciclo de estados do documento                  | `02-shared/estados.md`                                   |
| Nova rota Angular ou guard                     | `05-routes/<slug>.md`                                    |
| Nova config, `environments` ou build target    | `06-config.md`                                           |
| Nova convenção de teste                        | `07-testing.md`                                          |

---

## AGENTIC WORKFLOW

### Sessão nova

```
Verificar: docs/process-warnings.md (se existir)
Verificar: docs/workflow-state.md (se existir → avisar sessão em curso)
Ou usar: /mostra-workflow
```

### Commands disponíveis

Workflow em 3 camadas: **Commands → Skills → Agents**. Os commands e skills reais vivem em `.claude/`
deste repo (adaptados do backend Laravel, a fonte canónica do workflow). Grafo de sequência completo,
checkpoints e rastreabilidade: `docs/WORKFLOW.md`.

| Command                                    | Fase    | Produz                            |
| ------------------------------------------ | ------- | --------------------------------- |
| `/cria-issue <descrição>`                  | —       | Issue #N no GitHub                |
| `/planeia-issue [#N]`                      | Fase 1  | Brief + Spec + Plano              |
| `/implementa-plano [#N] [--stack angular]` | Fase 2  | Código + Commits                  |
| `/documenta-implementacao [#N]`            | Fase 3a | Debrief + system_spec + Changelog |
| `/publica-implementacao [#N]`              | Fase 3b | PR no GitHub                      |
| `/mostra-workflow`                         | —       | Estado atual do workflow         |

### Modo de trabalho

**Sempre Modo SDD Ativo** — checkpoints A, B, por tarefa, ②, D e E são obrigatórios.

### Objetivo de aprendizagem

Este projeto serve para aprender Standalone + Signals em Angular. A seção **"Aprendizagens"** no
Debrief (gerado por `escreve-debrief` em `/documenta-implementacao`) é **obrigatória e prioritária** —
deve documentar o que ficou mais claro sobre Standalone components, Signals, OnPush, zoneless ou lazy
loading após implementar a issue. Não omitir nem preencher com "N/A".

---

## MCP ANGULAR — USO OBRIGATÓRIO

> **OBRIGATÓRIO:** Antes de gerar ou alterar qualquer código Angular, executar as ferramentas do MCP
> `angular`. Não saltar este passo.

| Situação                                        | Ferramenta MCP obrigatória                         |
| ----------------------------------------------- | -------------------------------------------------- |
| Descoberta do workspace (1ª ação)              | `list_projects`                                    |
| Antes de qualquer alteração de código           | `get_best_practices` (standards da versão instalada) |
| Confirmar API/sintaxe de um conceito            | `search_documentation` (1-2 queries temáticas)     |

**Sequência obrigatória antes de gerar código:**

1. `list_projects` — descobrir workspace/projeto/targets.
2. `get_best_practices` — carregar os standards atuais (Standalone, Signals, OnPush, zoneless, Signal Forms).
3. `search_documentation` — confirmar a API concreta (ex: `HttpClient`, `signal forms`, `control flow`).
4. Só então gerar o código.

> A skill de stack `angular-best-practices` (em `.claude/skills/`) declara esta pré-condição e o
> Quick Reference completo. A skill `vitest-testing` cobre os testes.

---

## STACK TÉCNICO

- Angular 22 / TypeScript strict mode (TS ~6)
- Vitest (runner por omissão desde Angular 21)
- Zoneless change detection (`provideZonelessChangeDetection()`)
- ESLint + `angular-eslint`; Prettier
- Signal Forms (`@angular/forms/signals`, estável em v22)
- Tipos da API gerados via `openapi-typescript` (a partir do contrato do backend)

---

## FERRAMENTAS DE QUALIDADE

```bash
ng lint                              # ESLint + angular-eslint
ng build --configuration=production  # build de produção
ng test --coverage --watch=false     # Vitest, com cobertura
npm run sync:contract                # regenerar tipos a partir do contrato do backend
```

CI gates obrigatórios (mesma sequência corre localmente antes de publicar):

1. `ng lint`
2. `ng build --configuration=production`
3. `ng test --coverage --watch=false`

---

## CONVENÇÕES DE TESTES

Vitest via `ng test --watch=false`. Testes ao lado do código (`*.spec.ts`). Prioridade: signal stores
(input sintético), services (`HttpTestingController`), componentes (`TestBed` mínimo com
`provideZonelessChangeDetection()`). SSE nunca real nos testes — mockar o `SseStore`.

> Detalhe: `docs/system_spec/07-testing.md` e skill `vitest-testing`.
