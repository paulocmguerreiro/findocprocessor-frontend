# Skill: executa-testes

Executa os testes do stack ativo (Angular) e reporta o resultado. Auto-retry até 3x em caso de falha.

> **Categoria:** executa
> **Usado em:** `/implementa-plano` (após todas as tarefas)
> **Produz:** resultado dos testes — verde ✅ ou vermelho ⚠️ com detalhe

## Contrato

**Input:** stack ativo (lido de `STACK_CONFIG` no `CLAUDE.md`)

**Output:** resultado dos testes (verde / vermelho com detalhe)

**Usado em:** `/implementa-plano` (após todas as tarefas)

---

## Comando

| Stack   | Comando                                    | Padrão de ficheiros  |
| ------- | ------------------------------------------- | -------------------- |
| angular | `ng test --coverage --watch=false` (Vitest) | `**/*.spec.ts`       |

> O gate completo de qualidade (paridade com o CI) é `ng lint` + `ng build --configuration=production` + `ng test --coverage --watch=false`. Esta skill corre os **testes**; o gate lint+build é executado no passo seguinte de `/implementa-plano`.
> A flag `--coverage` é redundante (`coverage: true` já é opção fixa do target `test` no
> `angular.json`) — mantém-se explícita no comando por legibilidade.

---

## O que testar

- **Unit:** Signal stores com input sintético (sinais e computed) — ver `docs/system_spec/02-shared/padroes-signals.md`
- **Unit:** Pipes e diretivas
- **Unit:** Services HTTP com `HttpTestingController`
- **Component:** com `TestBed` mínimo (standalone, `provideZonelessChangeDetection()`)

> Detalhe das convenções: `docs/system_spec/07-testing.md` e skill `vitest-testing`.

---

## Comportamento

1. Executar o `TEST_RUNNER` do `CLAUDE.md` (`ng test --coverage --watch=false`)
2. Se falhar → aguardar 2s e tentar novamente (máximo 3 tentativas)
3. Se persistir após 3 tentativas → skill `regista-aviso` com WRN-NNN + avisar utilizador:
   ```
   ⚠️ Testes falharam após 3 tentativas — registado como WRN-NNN
   Detalhe:
   [output dos testes]
   Resolve antes de continuar para /documenta-implementacao
   ```
4. Se verde → reportar:
   ```
   ✅ Testes a verde
   <N> testes passaram em <Xs>
   ```

---

## Regras
- Testes são escritos na mesma tarefa que o código (nunca numa tarefa separada)
- Nunca subscrever SSE real nos testes — mockar o `SseStore`
- Nomes descritivos: `"deve_marcar_documento_como_erro_quando_estado_invalido"`
