# Forms

## Preferir Signal Forms (v22+)
- `@angular/forms/signals` é estável em v22 — usar para forms novos.
- Vantagens: estado por signals, acesso tipado aos campos, validação por schema.
- Confirmar a API atual com `search_documentation` (`signal forms`) — é uma área recente.

## Alternativa — Reactive Forms tipados
- Se não usar Signal Forms → **Reactive Forms** (`FormGroup`/`FormControl` tipados).
- **Nunca** Template-driven forms (`ngModel`) para lógica de negócio.

## Contexto do projeto
- Forms novos usam form tipado (Signal Forms, ou Reactive Forms tipados como alternativa).
- Validações alinhadas com o contrato do backend (o backend valida também — o form é UX, não a autoridade).
