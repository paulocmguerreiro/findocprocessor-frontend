# FinDocProcessor — Frontend Angular

## STACK_CONFIG

```
STACK:        angular
GITHUB_REPO:  paulocmguerreiro/findocprocessor-frontend
TEST_RUNNER:  ng test --watch=false
TEST_PATTERN: **/*.spec.ts
```

---

## ARQUITECTURA

**Abordagem:** Standalone components (sem NgModule), Features por domínio, Signals nativos (sem NgRx), OnPush em todos os componentes.

### Estrutura de features

```
src/app/features/<feature>/
  <feature>.component.ts   (standalone, OnPush)
  <feature>.routes.ts      (lazy loaded)
```

### Padrões obrigatórios

- `standalone: true` em todos os componentes
- `ChangeDetectionStrategy.OnPush` em todos os componentes
- Signals nativos — sem NgRx
- `SseStore` como singleton — SSE nunca subscrito em componentes
- `InjectionToken<string>` para `API_URL`
- `multipart/form-data` para upload — nunca base64 em JSON
- Lazy loading via `loadComponent()` em `app.routes.ts`
- TypeScript strict mode (`"strict": true` em `tsconfig.json`)
- Zoneless change detection

### O que NÃO fazer

- Não usar NgModule
- Não subscrever SSE directamente em componentes
- Não usar `localStorage` ou `sessionStorage`
- Não usar NgRx
- Não usar `any` no TypeScript
- Não desactivar strict mode

### Rotas da aplicação

| Rota         | Feature   | Descrição                                        |
| ------------ | --------- | ------------------------------------------------ |
| `/`          | dashboard | KPIs e gráficos de análise financeira            |
| `/documents` | documents | Tabela, upload drag-and-drop, file explorer, SSE |
| `/config`    | config    | Extraction templates e configurações             |

### Segurança e conformidade

- Nenhum dado sensível em `localStorage` ou `sessionStorage`
- Upload sempre `multipart/form-data`
- Erros 409 interceptados globalmente → toast

---

## SYSTEM_SPEC_MAP

| Tipo de alteração                  | Ficheiro system_spec a actualizar |
| ---------------------------------- | --------------------------------- |
| Novo componente ou feature         | `01-features.md`                  |
| Novo store ou signal               | `02-state.md`                     |
| Novo service, interceptor ou token | `03-core.md`                      |
| Novo model, interface ou enum      | `04-models.md`                    |
| Nova rota ou guard                 | `05-routes.md`                    |

---

## AGENTIC WORKFLOW

### Sessão nova

```
Verificar: docs/process-warnings.md (se existir)
Verificar: docs/workflow-state.md (se existir → avisar sessão em curso)
Ou usar: /mostra-workflow
```

### Commands disponíveis

Workflow em 3 camadas: **Commands → Skills → Agents**
Referência completa: `findocprocessor-workflow/.claude/CLAUDE.md`

| Command                                    | Fase    | Produz                            |
| ------------------------------------------ | ------- | --------------------------------- |
| `/cria-issue <descrição>`                  | —       | Issue #N no GitHub                |
| `/planeia-issue [#N]`                      | Fase 1  | Brief + Spec + Plano              |
| `/implementa-plano [#N] [--stack angular]` | Fase 2  | Código + Commits                  |
| `/documenta-implementacao [#N]`            | Fase 3a | Debrief + system_spec + Changelog |
| `/publica-implementacao [#N]`              | Fase 3b | PR no GitHub                      |
| `/mostra-workflow`                         | —       | Estado actual do workflow         |

### Modo de trabalho

**Sempre Modo SDD Activo** — checkpoints A, B, por tarefa, ②, D e E são obrigatórios.

### Objectivo de aprendizagem

Este projecto serve para aprender Standalone + Signals em Angular. A secção **"Aprendizagens"** no Debrief (gerado por `escreve-debrief` em `/documenta-implementacao`) é **obrigatória e prioritária** — deve documentar o que ficou mais claro sobre Standalone components, Signals, OnPush, zoneless ou lazy loading após implementar a issue. Não omitir nem preencher com "N/A".

---

## STACK TÉCNICO

- Angular 21 / TypeScript strict mode
- Vitest (default desde Angular 21)
- Zoneless change detection
- Tailwind CSS (configurado via Angular CLI)
- Signal Forms (experimental em v21 — usar com cautela)

---

## FERRAMENTAS DE QUALIDADE

```bash
ng lint                          # ESLint + @angular-eslint/recommended
ng build --configuration=production  # build de produção
ng test --watch=false            # Vitest
```

CI gates obrigatórios:

1. `ng lint`
2. `ng build --configuration=production`
3. `ng test --watch=false`
