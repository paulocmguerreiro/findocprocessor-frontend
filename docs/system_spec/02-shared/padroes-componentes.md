# Padrão — Componentes (template a copiar)

> Este ficheiro é um **padrão** — o código é para ser copiado em componentes novos. Confirmar sempre a
> API atual com o MCP `angular` (`get_best_practices`), que é a fonte de verdade da versão instalada.

`document-row.component.ts`:

```ts
import { Component, inject, input, output, computed } from '@angular/core';
import type { Documento } from '../../contrato';
import { DocumentStore } from '../../state/document.store';

@Component({
  selector: 'app-document-row',
  // standalone é o default (v20+) — NÃO escrever standalone: true
  // OnPush é o default (v22+) — NÃO escrever changeDetection: OnPush
  templateUrl: './document-row.component.html', // SEMPRE ficheiro à parte
  styleUrl: './document-row.component.scss',     // SEMPRE ficheiro à parte
  host: { '[attr.data-estado]': 'documento().estado' },
})
export class DocumentRowComponent {
  // input()/output() funções — nunca @Input()/@Output()
  readonly documento = input.required<Documento>();
  readonly seleccionar = output<string>();

  // dependências via inject() — nunca construtor
  private readonly store = inject(DocumentStore);

  // estado derivado via computed()
  readonly estaEmErro = computed(() => this.documento().estado === 'ERRO');
}
```

`document-row.component.html`:

```html
<tr [class.is-error]="estaEmErro()">
  <td>{{ documento().nome_ficheiro_original }}</td>
  <td>{{ documento().estado }}</td>
</tr>
```

## Regras (resumo — detalhe na skill `angular-best-practices`)
- Standalone + OnPush por **default** (não escrever explicitamente).
- `input()`/`output()`, `inject()`, `host` object — nunca decorators de input/output nem `@HostBinding`/`@HostListener`.
- Control flow `@if`/`@for (… track …)`/`@switch`; `class`/`style` bindings.
- **Template e estilos sempre em ficheiros separados** (`templateUrl`/`styleUrl`) — nunca inline.
- Sem lógica complexa no template (usar `computed()`).
- Sem estado partilhado no componente — isso vive no signal store.
- Acessibilidade: AXE + WCAG AA.
