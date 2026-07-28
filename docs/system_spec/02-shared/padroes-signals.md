# Padrão — Signal Stores (template a copiar)

> Ficheiro **padrão** — código para copiar em stores novos. Confirmar a API atual com o MCP `angular`.

Estado partilhado da aplicação vive em signal stores singleton em `src/app/state/`.

```ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DocumentStore {
  // estado privado como signal
  private readonly _documentos = signal<Documento[]>([]);
  private readonly _aCarregar = signal(false);

  // leitura pública readonly
  readonly documentos = this._documentos.asReadonly();
  readonly aCarregar = this._aCarregar.asReadonly();

  // estado derivado
  readonly contagemPorEstado = computed(() => {
    const acc = {} as Record<EstadoDocumento, number>;
    for (const doc of this._documentos()) {
      if (doc.estado) { acc[doc.estado] = (acc[doc.estado] ?? 0) + 1; }
    }
    return acc;
  });

  // mutação via set/update — nunca mutate
  setDocumentos(docs: Documento[]): void { this._documentos.set(docs); }
  atualizarUm(doc: Documento): void {
    this._documentos.update(list => list.map(d => (d.id === doc.id ? doc : d)));
  }
}
```

## Regras
- `providedIn: 'root'` (singleton). Estado privado (`_nome`) + leitura `readonly` pública.
- `computed()` para derivados; `set`/`update` para mutação — **nunca** `mutate`.
- **SSE nunca aqui diretamente nos componentes** — o `SseStore` recebe o stream e chama métodos dos outros stores (`04-core/sse.md`).
- Signals são o default; NgRx/RxJS permitidos quando acrescentam valor (streams/operadores), com interop via `toSignal()`/`toObservable()`. Sem lógica de UI (formatação/apresentação fica nos componentes/pipes).
- Componentes lêem os signals e chamam métodos — não guardam cópias do estado partilhado.
