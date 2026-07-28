# Templates, Control Flow & Accessibility

## Control flow (nativo)
- `@if`, `@for`, `@switch` — **nunca** `*ngIf`, `*ngFor`, `*ngSwitch`.
- `@for` exige `track` (ex: `@for (doc of docs(); track doc.id)`).
- `@empty` para estado vazio de listas.

## Bindings
- `class` / `style` bindings — **nunca** `ngClass` / `ngStyle`.
- `async` pipe para observables no template.
- Templates simples, sem lógica complexa — mover cálculo para `computed()`.
- Não assumir globais (`new Date()`) disponíveis no template.

## Acessibilidade (obrigatória)
- Passar **todos** os checks AXE.
- Cumprir **WCAG AA** no mínimo: gestão de foco, contraste de cor, atributos ARIA.
- Elementos interativos acessíveis por teclado; labels associados a inputs; ordem de foco lógica.
