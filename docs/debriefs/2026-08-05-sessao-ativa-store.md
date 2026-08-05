# Debrief: SessaoAtivaStore — estado de sessão ativa (token, estaAutenticado)

**Issue:** #5
**Branch:** feat/sessao-ativa-store
**Data:** 2026-08-05
**Commits:** 2

## O que foi implementado

Primeira peça de estado partilhado do projeto: `SessaoAtivaStore`, singleton `@Service()` em
`src/app/state/`, com um único signal privado a guardar o bearer token da sessão. Expõe o token em
leitura readonly (`tokenParaAutorizacao`) e o derivado `estaAutenticado`, mais os métodos
`registarSessao` e `encerrarSessao`. Sem HTTP, sem dependências injetadas e sem persistência — o
estado vive só em memória.

Acompanha uma regra `no-restricted-syntax` no `eslint.config.js` que restringe a leitura do token a
`src/app/core/interceptors/**`, com a eficácia verificada por falha real do `ng lint`.

## Ficheiros alterados

| Ficheiro | Tipo de alteração | Notas |
| -------- | ----------------- | ----- |
| `src/app/state/sessao-ativa.store.ts` | criado | Store completo; JSDoc regista as invariantes que não se leem no código (sem persistência, recebe `string` já desembrulhada, não valida a forma do token) |
| `src/app/state/sessao-ativa.store.spec.ts` | criado | 5 testes: estado inicial, registo, sobreposição (RN-02), encerrar, encerrar sem sessão (RN-03), token vazio (RN-04) |
| `eslint.config.js` | alterado | Regra ancorada em `tokenParaAutorizacao` + bloco de exceção posterior |

## Decisões tomadas

| Decisão | Alternativa considerada | Porquê esta |
| ------- | ----------------------- | ----------- |
| `tokenParaAutorizacao = this.#token.asReadonly()` | `computed(() => this.#token())` | `asReadonly()` partilha o mesmo nó reativo (`readonlyFn[SIGNAL] = node`); `computed()` cria um nó novo, com cache e invalidação próprias, para reencaminhar um valor sem o transformar. O ganho é de legibilidade, não de desempenho: distingue na sintaxe o que é estado do que é derivado, evitando que dois `computed()` seguidos pareçam a mesma coisa |
| Estado em campo privado nativo `#token` | `private readonly _token` | Sendo privado, que o seja também em runtime e não só para o TypeScript. Diverge do template atual de `padroes-signals.md`, que passa a acompanhar |
| `@Service()` sem `providedIn` | `@Injectable({ providedIn: 'root' })` | `get_best_practices` (v22) recomenda-o explicitamente para singletons novos. Critério geral do projeto: `@Service()` quando é root, `@Injectable()` caso contrário |
| Exceção da regra ESLint no ficheiro concreto `sessao-ativa.store.spec.ts` | `**/*.spec.ts` | Uma exceção a todos os testes deixaria qualquer spec ler o token e tornava a regra decorativa (risco R5 do Plano) |
| Verificação da regra por falha real, não por inspeção | Assumir que o seletor está correto | Uma regra que nunca se viu falhar não está verificada. O `ng lint` acusou 1 erro no ficheiro temporário e nenhum no store nem no spec — o que provou de passagem que a declaração `readonly tokenParaAutorizacao = …` é um `PropertyDefinition` e fica fora do seletor, como o Plano previa sem confirmar |
| Nomes de teste em `snake_case` | Frases com espaços | `07-testing.md` fixa o formato descritivo (`deve_marcar_documento_como_erro_quando_estado_invalido`); a tabela T-01…T-06 do Plano já os nomeava assim |
| Asserções `toBe(true)` / `toBe(false)` | `toBeTruthy()` / `toBeFalsy()` | `estaAutenticado()` é tipado `boolean`; a asserção exata documenta melhor a intenção e continua a proteger se a assinatura mudar |

## Desvios ao Plano

- **T-03 (`deve_manter_token_em_leituras_sucessivas`) removido.** Ler o mesmo signal duas vezes sem
  escrita pelo meio não pode devolver valores diferentes — não há nada que invalide a cache entre as
  duas leituras, e o teste limitava-se a repetir as asserções de T-02. Consequência a registar: a
  cláusula do **CA-10** que exige cobrir *"que o valor registado persiste em leituras sucessivas"*
  fica sem teste. As outras duas cláusulas do CA-10 (RN-02 e RN-03) continuam cobertas por T-04 e T-06.
- **Teste de RN-04 acrescentado, fora de T-01…T-06.** `registarSessao('')` deixar a aplicação
  autenticada é o comportamento mais surpreendente do store e uma decisão consciente (R2 do Brief);
  sem teste, corria o risco de ser "corrigido" mais tarde por quem não conhecesse a decisão.
- **`06-config.md` não atualizado na Fase 2**, apesar de a Spec o listar. É trabalho desta fase — o
  Plano põe explicitamente a atualização do system_spec fora do âmbito da implementação.

## Aprendizagens

**`asReadonly()` vs `computed()` — nem toda a leitura derivada é um derivado.** A diferença mecânica
está em `signalAsReadonlyFn`: o readonly recebe o **mesmo** nó reativo do signal de origem
(`readonlyFn[SIGNAL] = node`), enquanto um `computed()` cria um nó independente que se regista como
consumidor da fonte e como produtor para quem o ler. Para um passthrough, o `computed()` acrescenta
uma camada que existe para não fazer nada. O que se ganha ao trocar não é velocidade — é a leitura do
ficheiro: `computed()` passa a significar sempre "aqui há transformação".

**Ler signals é síncrono; o zoneless não intervém.** Signals são *pull-based*: `set()` escreve
imediatamente e `computed()` só recalcula quando alguém o lê. Nos testes deste store não há nada por
onde esperar — sem `whenStable()`, sem `detectChanges()`, sem `fakeAsync`. O que exige espera é o
*render* do template, o `effect()` (que corre num microtask agendado) e o `toObservable()`, que
assenta em `effect()`. Corolário honesto: o `provideZonelessChangeDetection()` no TestBed deste spec
não está a fazer nada — está lá por RNF-04 e por preparar o terreno, não porque os testes dependam
dele. É esta assimetria que torna os signal stores a camada mais barata de testar do projeto.

**Standalone/`@Service()` em v22 — o default deixou de se escrever.** O idioma da v22 é omitir o que
é implícito: nada de `standalone: true`, nada de `OnPush` explícito, e `@Service()` em vez de
`@Injectable({ providedIn: 'root' })` para singletons. O store não injeta nada e nunca precisou de
`inject()`, o que torna visível que "singleton auto-provido" e "tem dependências" são eixos
independentes.

**Um erro de caminho ensina o método de geração.** Os ficheiros nasceram em
`src/app/src/app/state/sessao-ativa.store.ts.ts` — `src/app/` duplicado e extensão dupla — por o
`ng generate` ter recebido um caminho já completo estando dentro de `src/app`. O sintoma visível foi
a classe sair como `SessaoAtivaStoreTs`: o gerador deriva o nome PascalCase do nome do ficheiro, por
isso um `.ts` a mais no nome vira sufixo da classe. Ficaram por versionar e foram movidos antes do
primeiro commit.

**A barreira do token é de análise estática, e convém não a lembrar como mais do que isso.** A regra
faz a leitura indevida rebentar o CI; não a impede. Cai perante um `eslint-disable` e não vê código
que não passe pelo lint. Foi decisão consciente (R3), mas é o tipo de mitigação que a memória tende a
promover a garantia.

## SYSTEM_SPEC a atualizar

- `docs/system_spec/04-core/sessao-ativa.md` — **criar**: responsabilidade do store, API pública,
  invariantes (RN-01 a RN-05), fronteira de quem desembrulha o token, e a regra ESLint com o motivo
  do nome não-renomeável.
- `docs/system_spec/00-index.md` — linha nova na tabela `Core` a apontar para o ficheiro acima.
- `docs/system_spec/02-shared/padroes-signals.md` — critério de escolha do decorador (`@Service()` se
  root, `@Injectable()` caso contrário) e estado privado com campo privado nativo (`#token`) em vez de
  `_token`; o exemplo de código acompanha.
- `docs/system_spec/02-shared/contratos-por-camada.md` — as secções `src/app/core/` e `src/app/state/`
  dizem `providedIn: 'root'`; passam a refletir o mesmo critério de decorador.
- `docs/system_spec/06-config.md` — registar a regra de lint nova (`eslint.config.js` passa a ter uma
  regra de projeto, não só as de `angular-eslint`).

## Verificação final

- [x] Linter a verde — `ng lint`
- [x] Testes a verde — `ng test --watch=false` (8 testes)
- [x] Build de produção a verde — `ng build --configuration=production`
- [x] Nenhum dado sensível em logs — o store não escreve para consola
- [x] Nenhum segredo em código — o token é sempre recebido em runtime, nunca literal
- [x] Sem `localStorage`/`sessionStorage`/cookies/`TransferState`
