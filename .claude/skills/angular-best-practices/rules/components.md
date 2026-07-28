# Componentes Standalone & Estrutura

## Standalone é o default (v20+)
- **NÃO** escrever `standalone: true` — é implícito. Nunca reintroduzir `NgModule`.
- Um componente = uma responsabilidade; mantê-los pequenos.

## OnPush é o default (v22+)
- **NÃO** definir `changeDetection: ChangeDetectionStrategy.OnPush` — é o default. Nunca reverter para `Default`.

## Template e estilos — SEMPRE em ficheiros separados
- Usar **sempre** `templateUrl` + `styleUrl` (ou `styleUrls`) a apontar para `.component.html` e `.component.scss`.
- **Nunca** usar `template:` nem `styles:`/`styleUrls` inline, mesmo em componentes pequenos.
- Os caminhos são relativos ao `.ts` do componente.

## Inputs, outputs, injeção
- `input()` / `input.required()` e `output()` (funções) — **nunca** decorators `@Input()`/`@Output()`.
- `inject()` — **nunca** injeção por construtor em código novo.
- Host bindings/listeners no objeto `host` de `@Component`/`@Directive` — **nunca** `@HostBinding`/`@HostListener`.

## Organização de ficheiros
```
src/app/features/<feature>/
  <feature>.component.ts    (standalone; sem template/estilos inline)
  <feature>.component.html  (template — SEMPRE à parte)
  <feature>.component.scss  (estilos — SEMPRE à parte)
  <feature>.routes.ts       (lazy loaded)
```

## Anti-padrões
- `NgModule`, `standalone: true` explícito, `OnPush` explícito, `template:`/`styles:` inline, decorators de input/output, injeção por construtor, `@HostBinding`/`@HostListener`.
