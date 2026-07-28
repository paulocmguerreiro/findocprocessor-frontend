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
- Gate completo (paridade CI): `ng lint` + `ng build --configuration=production` + `ng test --watch=false`.
- Acessibilidade: quando aplicável, asserções AXE nos componentes.
