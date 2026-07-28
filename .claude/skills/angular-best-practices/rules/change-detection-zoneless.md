# Change Detection & Zoneless

- A app é **zoneless** — `provideZonelessChangeDetection()` em `app.config.ts`. Não há Zone.js.
- Não depender de mecanismos de Zone.js: sem `NgZone.run()`/`runOutsideAngular()`, sem assumir CD automático após callbacks assíncronos arbitrários.
- O estado reativo é conduzido por **signals** — a CD dispara quando um signal lido no template muda. Mutar estado fora de signals pode não atualizar a UI.
- Ao integrar APIs assíncronas (WebSocket/SSE/timers), escrever o resultado num `signal` para propagar a mudança.
- `NgOptimizedImage` para todas as imagens estáticas (não funciona para base64 inline).

## Verificação
- Se a UI não atualiza após uma operação assíncrona, a causa provável é estado mutado fora de um signal — mover para `signal`/`update`.
