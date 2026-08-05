---
name: vitest-testing
description: "Use this skill for Angular testing with Vitest only. Trigger whenever any test is being written, edited, fixed, or refactored — including fixing tests that broke after a code change, adding assertions, testing signal stores, services with HttpTestingController, components with TestBed, pipes, directives, and TDD workflows. Always activate when the user asks how to write an Angular test, mentions *.spec.ts files, TestBed, or needs to test signals, computed state, or zoneless change detection. Covers: describe/it/expect, TestBed.configureTestingModule, provideZonelessChangeDetection, ComponentFixture, HttpTestingController, fakeAsync/tick, and Vitest features. Do not use for non-test code."
license: MIT
metadata:
  author: angular
---

# Vitest Testing (Angular v22)

Angular v22 usa **Vitest** como runner de testes por omissão. Correr: `ng test --coverage --watch=false`.

## Pré-condição obrigatória — MCP `angular`

Antes de escrever ou alterar qualquer teste, executar obrigatoriamente:

1. `get_best_practices` — standards da versão instalada.
2. `search_documentation` — queries temáticas relevantes (ex: `testing signals`, `HttpTestingController`, `component harness`, `fakeAsync`).

Não saltar este passo — a API de testes evolui entre versões (zoneless, signals) e o MCP garante exemplos corretos.

## Estrutura & execução

- Testes ao lado do código: `src/app/**/*.spec.ts`.
- Correr tudo: `ng test --coverage --watch=false`. Filtrar por ficheiro/nome conforme o output do runner.
- Sintaxe Vitest: `describe()`, `it()`/`test()`, `expect()`. Verificar ficheiros-irmãos para a convenção do projeto antes de escrever.
- **Não remover testes sem aprovação** — são código core.

## Zoneless — TestBed mínimo

A app é zoneless: fornecer `provideZonelessChangeDetection()` no TestBed. Chamar `fixture.detectChanges()` (ou `await fixture.whenStable()`) para materializar signals no DOM.

```ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
});
```

## Signal stores (unit, prioritário)

Testar stores com input sintético — sem TestBed quando o store é uma classe simples, ou via `TestBed.inject()` quando é `providedIn: 'root'`.

```ts
it('deve derivar a contagem por estado', () => {
  const store = TestBed.inject(DocumentStore);
  store.setDocuments([/* fixtures tipadas do contrato */]);
  expect(store.contagemPorEstado()['PROCESSADO']).toBe(2);
});
```

- Ler o valor de um signal chamando-o: `store.documentos()`.
- Nunca subscrever SSE real — mockar o `SseStore`.

## Services HTTP

Usar `provideHttpClient()` + `provideHttpClientTesting()` e `HttpTestingController`:

```ts
const http = TestBed.inject(HttpTestingController);
service.listar().subscribe(/* ... */);
http.expectOne(`${API}/documentos`).flush({ /* envelope tipado */ });
http.verify();
```

## Componentes

- `TestBed.createComponent(Cmp)` → `ComponentFixture`.
- Definir inputs com `fixture.componentRef.setInput('nome', valor)`.
- `fixture.detectChanges()` antes de asserções ao DOM.
- Usar `fakeAsync` + `tick()` para temporizadores; `flush()` para esvaziar a fila.

## Assertions

- Preferir matchers específicos (`toBe`, `toEqual`, `toContain`, `toHaveBeenCalledWith`).
- Mocks/spies: `vi.fn()`, `vi.spyOn()`.

## Common Pitfalls

- Esquecer `provideZonelessChangeDetection()` → CD não dispara nos testes.
- Esquecer `fixture.detectChanges()`/`whenStable()` antes de asserções ao DOM.
- Subscrever SSE real em vez de mockar o `SseStore`.
- Redefinir tipos do contrato em fixtures — importar de `src/app/contrato/` (gerado).
- Apagar testes sem aprovação.
