# Testes

Runner: **Vitest** (default do Angular desde v21). Comando: `ng test --watch=false`.
Skill de apoio: `vitest-testing`.

## Estrutura
- Testes ao lado do código: `src/app/**/*.spec.ts`.
- Sintaxe Vitest: `describe`/`it`/`expect`; `vi.fn()`/`vi.spyOn()` para mocks.

## Zoneless — TestBed
Fornecer `provideZonelessChangeDetection()` no TestBed; chamar `fixture.detectChanges()` /
`await fixture.whenStable()` para materializar signals no DOM.

## Prioridades por tipo

| Alvo | Como | Notas |
| --- | --- | --- |
| Signal store | `TestBed.inject(Store)` + input sintético | ler signals chamando-os; asserção sobre `computed()` |
| Service HTTP | `provideHttpClientTesting()` + `HttpTestingController` | `expectOne().flush(envelope)`, `verify()` |
| Componente | `TestBed.createComponent` + `setInput()` | `detectChanges()` antes de asserções ao DOM |
| Pipe/diretiva | unit direto | — |

## Regras
- Testes escritos na **mesma tarefa** que o código (nunca numa tarefa "adicionar testes").
- **SSE nunca real** — mockar o `SseStore`.
- Fixtures usam tipos do contrato (`src/app/contrato/`) — não redefinir tipos à mão.
- Nomes descritivos: `"deve_marcar_documento_como_erro_quando_estado_invalido"`.
- Gate completo (paridade CI): `ng lint` + `ng build --configuration=production` + `ng test --coverage --watch=false`.
- Acessibilidade: quando aplicável, asserções AXE nos componentes.

## Cobertura

Motor **`@vitest/coverage-v8`** (nativo do runtime, sem instrumentação adicional). Configurado no
target `test` do `angular.json` — ver opções concretas em `06-config.md`.

- **`coverageInclude`** fica restrito aos ficheiros que já têm `*.spec.ts` associado — não
  `src/app/**` inteiro. Alargar o âmbito é decisão da issue que criar código novo numa pasta ainda
  sem testes (hoje só `src/app/app.ts` e `src/app/state/**`; o resto de `features/`, `core/`,
  `shared/`, `models/` são pastas só com `.gitkeep`).
- **`coverageExclude`** cobre, no mínimo, `src/app/contrato/**` (gerado — já ignorado no ESLint).
- **Limiares** (`coverageThresholds`) calibrados a partir da cobertura real medida sobre o
  `coverageInclude`, com margem — não o valor exato medido, para não rebentar o gate com uma linha
  pontual não coberta. Ponto de partida (2026-08-05, `app.ts` + `SessaoAtivaStore`): 100% medido,
  limiar fixado a 95%. Revistos quando o `coverageInclude` alargar.
- **`coverage: true` é opção do target, não da invocação** — aplica-se a qualquer `ng test`
  (`--watch=false` ou não), com ou sem `--coverage` explícito no CLI. Não existe um modo "sem
  cobertura" separado enquanto essa opção estiver no `angular.json`.
- Ficheiros com template externo (`.component.html`) contam como entrada própria no relatório do
  provider `v8` — manter o template em ficheiro à parte não os isenta de medição; só entram no
  relatório se o `coverageInclude` também os apanhar.
