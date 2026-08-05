# Plano: SessaoAtivaStore — estado de sessão ativa (token, estaAutenticado)

**Issue:** #5
**Spec:** docs/specs/2026-08-05-sessao-ativa-store.md
**Data:** 2026-08-05

## Tarefas

### Tarefa 1 — `SessaoAtivaStore` + testes

- **Ficheiros a criar/alterar:**
  - `src/app/state/sessao-ativa.store.ts` _(novo)_
  - `src/app/state/sessao-ativa.store.spec.ts` _(novo)_
- **O que implementar:**
  - Classe `SessaoAtivaStore` decorada com `@Service()` (importado de `@angular/core`), sem
    `providedIn`, sem `@Injectable`, sem `inject()` e sem qualquer dependência (RF-01, RNF-02).
  - Estado: campo privado nativo `readonly #token = signal<string | null>(null)` (RF-02).
  - Leitura pública `readonly tokenParaAutorizacao = this.#token.asReadonly()` (RF-03), precedida de
    um comentário que declara o nome como não-renomeável e explica porquê — é a âncora do seletor
    ESLint da Tarefa 2 e renomeá-lo desativa a proteção sem que nada falhe (CA-08).
  - `readonly estaAutenticado = computed(() => this.#token() !== null)` (RF-04, RN-01).
  - `registarSessao(token: string): void` → `this.#token.set(token)` (RF-05); sobrepõe token anterior
    sem exigir `encerrarSessao` (RN-02).
  - `encerrarSessao(): void` → `this.#token.set(null)` (RF-06); seguro sem sessão ativa (RN-03).
  - Comentário breve a registar que o store recebe a `string` já desembrulhada e não valida a forma do
    token (RN-04) — a extração de `Token['data']['token']` é de quem faz HTTP.
  - Português de Portugal, grafia AO90, nos comentários; sem `any` (RNF-01).
- **Testes associados:** `sessao-ativa.store.spec.ts` — ver tabela "Testes a escrever" (T-01 a T-06).
  `TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] })` +
  `TestBed.inject(SessaoAtivaStore)` (RNF-04).
- **Commit:** `✨ feat(state): SessaoAtivaStore com token e estaAutenticado em signals`

### Tarefa 2 — Regra ESLint que restringe a leitura do token

- **Ficheiros a criar/alterar:**
  - `eslint.config.js` _(alterar)_
- **O que implementar:**
  - No bloco `files: ["**/*.ts"]`, regra `no-restricted-syntax` com
    `selector: 'MemberExpression[property.name="tokenParaAutorizacao"]'` e uma `message` que explica a
    restrição e indica o sítio autorizado (RF-07, RN-05).
  - Bloco de configuração **posterior** (a ordem importa em flat config — o último a aplicar-se vence)
    com `files: ["src/app/core/interceptors/**/*.ts", "src/app/state/sessao-ativa.store.spec.ts"]` e
    `rules: { "no-restricted-syntax": "off" }`.
    - A exceção do `.spec.ts` é dada ao **ficheiro concreto**, não a `**/*.spec.ts` — uma exceção
      genérica a todos os testes deixaria qualquer spec ler o token e esvaziaria a regra.
    - O ficheiro do store **não** precisa de exceção: a declaração
      `readonly tokenParaAutorizacao = …` é um `PropertyDefinition`, não um `MemberExpression`, e
      internamente o store lê `this.#token`, não o signal público. Confirmar na verificação abaixo em
      vez de assumir.
  - **Verificação de eficácia (CA-09), não opcional:** criar um ficheiro temporário fora de
    `core/interceptors/` que leia `tokenParaAutorizacao`, correr `ng lint` e confirmar que **falha**;
    apagar o ficheiro; correr `ng lint` de novo e confirmar que passa a verde com o store e o spec já
    no sítio. Uma regra que nunca se viu falhar não está verificada.
- **Testes associados:** nenhum `*.spec.ts` — a regra é verificada pelo próprio `ng lint`, conforme
  descrito acima.
- **Commit:** `🔧 chore(infra): restringir leitura de tokenParaAutorizacao ao interceptor`

## Ordem de implementação

1. **Tarefa 1** — cria o símbolo `tokenParaAutorizacao` em que a regra da Tarefa 2 se ancora. Sem ele,
   a regra passaria a verde por não ter nada que apanhar, e a verificação de eficácia seria vácua.
2. **Tarefa 2** — depende do símbolo acima e do `.spec.ts` da Tarefa 1 para provar que a exceção está
   corretamente delimitada (o spec lê o token e tem de continuar a passar).

Respeita a ordem de camadas do `CLAUDE.md` (`contrato → models → core → state → features`): esta issue
só toca `state/`, mais configuração de qualidade.

## Testes a escrever

| Teste | Tipo | Ficheiro | Verifica |
| ----- | ---- | -------- | -------- |
| T-01 `deve_iniciar_sem_sessao_ativa` | unit | `sessao-ativa.store.spec.ts` | Estado inicial: `tokenParaAutorizacao()` é `null` e `estaAutenticado()` é `false` (CA-05) |
| T-02 `deve_registar_token_e_ficar_autenticado` | unit | `sessao-ativa.store.spec.ts` | Após `registarSessao('abc')`: token é `'abc'` e `estaAutenticado()` é `true` (CA-05, RN-01) |
| T-03 `deve_manter_token_em_leituras_sucessivas` | unit | `sessao-ativa.store.spec.ts` | Leituras repetidas devolvem o mesmo valor — o estado persiste na instância, não é recalculado nem perdido (CA-10) |
| T-04 `deve_sobrepor_token_ao_registar_sessao_nova` | unit | `sessao-ativa.store.spec.ts` | `registarSessao('a')` seguido de `registarSessao('b')` deixa `'b'`, sem `encerrarSessao` pelo meio (RN-02, CA-10) |
| T-05 `deve_limpar_token_ao_encerrar_sessao` | unit | `sessao-ativa.store.spec.ts` | Após `encerrarSessao()`: token a `null` e `estaAutenticado()` a `false` (CA-05) |
| T-06 `deve_encerrar_sessao_sem_sessao_ativa_sem_erro` | unit | `sessao-ativa.store.spec.ts` | `encerrarSessao()` numa instância sem token não lança e mantém o estado "sem sessão" (RN-03, CA-10) |

## Dependências

- Issues bloqueantes: nenhuma.
- Deve ser implementada após: nenhuma.

## Riscos de implementação

> Consolidados do Brief (`## Riscos identificados`) e da Spec.

- **R1 (Brief) — envelope do token.** `Token` é `{ data?: { token?: string } }`; o valor útil é
  `string | undefined`. O store recebe `string` já resolvida e não desembrulha nada. Se essa fronteira
  não ficar clara no comentário do store, o `| undefined` acaba por escorregar para dentro do estado e
  `estaAutenticado` passa a ter três valores em vez de dois.
- **R2 (Brief) — string vazia.** `registarSessao('')` deixa a app autenticada com credencial inútil.
  Decisão consciente (RN-04): o store não valida; o comentário tem de o dizer.
- **R3 (Brief) — a barreira do token é só de lint.** Cai com um `eslint-disable` e não protege código
  que não passe pelo lint. Serve para que a leitura indevida rebente o CI, não para a impedir.
- **R4 (Brief) — store sem consumidores.** Nada na app o usa; os testes são a única prova de que
  funciona, daí T-03/T-04/T-06 além do mínimo dos CAs.
- **R5 — a exceção da regra ESLint pode anular a regra.** Uma exceção larga (`**/*.spec.ts`, ou a
  pasta `state/` inteira) tornaria a regra decorativa. Delimitar ao ficheiro concreto e provar por
  falha real, como descrito na Tarefa 2.
- **R6 — ordem dos blocos em flat config.** A desativação tem de vir **depois** do bloco que define a
  regra; invertida, a regra fica ativa em todo o lado e o `.spec.ts` da Tarefa 1 passa a falhar o gate.
- **`scope` de commit fora da lista.** `propoe-commit` lista `features|shared|models|infra|routes|jobs|tests`
  — herdados do repo Laravel. A Tarefa 1 usa `state`, que descreve a camada Angular real; a Tarefa 2
  usa `infra`, que já existe na lista. Confirmar no checkpoint da tarefa, ou trocar `state` por
  `shared` se se preferir não alargar a lista.

## O que NÃO fazer nesta issue

- **Não** atualizar `docs/system_spec/*.md` nem `00-index.md` — é da Fase 3a
  (`/documenta-implementacao` → `atualiza-spec`), informada pelo Debrief. A Spec já regista **quais**
  os ficheiros a atualizar; a execução não pertence a esta fase.
- **Não** criar o serviço de autenticação, o serviço de perfil/permissões nem o interceptor de
  autenticação — só a pasta de exceção da regra ESLint os antecipa.
- **Não** criar nada em `src/app/models/` — a assinatura é `string`, não há view-model a compor.
- **Não** tocar em `src/app/contrato/` (é gerado) nem importar tipos do contrato neste store.
- **Não** ativar linting com informação de tipos (`projectService` / `recommendedTypeChecked`) — a
  regra desta issue é sintática (RNF-06).
- **Não** guardar nome, email ou roles — dependem de `GET /auth/me`, que não existe no contrato.
- **Não** persistir o token em `localStorage`/`sessionStorage`/cookies/`TransferState`.
- **Não** criar componentes, rotas ou guards.
