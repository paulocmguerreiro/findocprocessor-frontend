# Padrão — Signal Stores (template a copiar)

> Ficheiro **padrão** — código para copiar em stores novos. Confirmar a API atual com o MCP `angular`.

Estado partilhado da aplicação vive em signal stores singleton em `src/app/state/`.

```ts
import { computed, Service, signal } from '@angular/core';

@Service()
export class DocumentStore {
  // estado privado como signal — campo privado nativo do JavaScript
  readonly #documentos = signal<Documento[]>([]);
  readonly #aCarregar = signal(false);

  // leitura pública readonly
  readonly documentos = this.#documentos.asReadonly();
  readonly aCarregar = this.#aCarregar.asReadonly();

  // estado derivado
  readonly contagemPorEstado = computed(() => {
    const acc = {} as Record<EstadoDocumento, number>;
    for (const doc of this.#documentos()) {
      if (doc.estado) { acc[doc.estado] = (acc[doc.estado] ?? 0) + 1; }
    }
    return acc;
  });

  // mutação via set/update — nunca mutate
  setDocumentos(docs: Documento[]): void { this.#documentos.set(docs); }
  atualizarUm(doc: Documento): void {
    this.#documentos.update(list => list.map(d => (d.id === doc.id ? doc : d)));
  }
}
```

## Regras
- **Decorador:** `@Service()` quando o singleton é root (auto-provido, o caso normal de um store);
  `@Injectable()` quando não é. Critério transversal do projeto, não só dos stores.
- Estado privado em **campo privado nativo** (`#nome`) — sendo privado, que o seja também em runtime e
  não só para o TypeScript. Leitura pública `readonly`.
- **Leitura pública com `asReadonly()`, não `computed()`** — expor o estado é a mesma operação de
  leitura sobre o mesmo nó reativo; `computed()` criaria um nó novo só para reencaminhar o valor.
  Reservar `computed()` para o que transforma mesmo, para que a sintaxe distinga estado de derivado.
- `computed()` para derivados; `set`/`update` para mutação — **nunca** `mutate`.
- **SSE nunca aqui diretamente nos componentes** — o `SseStore` recebe o stream e chama métodos dos outros stores (`04-core/sse.md`).
- Signals são o default; NgRx/RxJS permitidos quando acrescentam valor (streams/operadores), com interop via `toSignal()`/`toObservable()`. Sem lógica de UI (formatação/apresentação fica nos componentes/pipes).
- Componentes lêem os signals e chamam métodos — não guardam cópias do estado partilhado.
