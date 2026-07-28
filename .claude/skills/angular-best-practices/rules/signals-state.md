# Signals & State

## Local state
- `signal()` para estado local do componente.
- `computed()` para estado derivado — nunca recalcular à mão.
- `update()` / `set()` — **nunca** `mutate()`.
- Transformações puras e previsíveis; sem efeitos secundários dentro de `computed()`.

## Shared state — signal stores
- Estado partilhado vive em signal stores singleton em `src/app/state/` (`providedIn: 'root'`), **não** nos componentes.
- Um store expõe signals `readonly` (via `.asReadonly()` ou getters) e métodos que mutam via `set`/`update`.
- Componentes lêem signals do store e chamam métodos — não mantêm cópias do estado partilhado.

## SSE
- **SSE nunca é subscrito em componentes.** Apenas o `SseStore` estabelece/consome o stream e distribui para os outros stores. Ver `docs/system_spec/04-core/sse.md`.

## RxJS / NgRx (permitidos, com interop)
- Signals são o **default** para estado; **RxJS/NgRx não são proibidos** — usar quando acrescentam valor: streams e operadores (`debounceTime`, `takeUntilDestroyed`, `switchMap`), efeitos, side-effects assíncronos.
- Interop signal↔observable via `toSignal()` / `toObservable()`; é esperado converter entre os dois paradigmas.

## Proibido
- `effect()` para lógica que devia ser `computed()`.
- Estado partilhado duplicado entre componentes.
