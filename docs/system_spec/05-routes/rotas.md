# Rotas & Guards

_Nenhuma rota implementada ainda._ As rotas são documentadas aqui **à medida que forem implementadas**
(via `atualiza-spec`) — não se antecipam no spec.

## Padrão a seguir (quando existirem)

- Rotas de feature **lazy** via `loadComponent()` em `app.routes.ts`.
- Uma feature com várias rotas internas expõe `<feature>.routes.ts`, carregada por `loadChildren()`.
- `{ path: '**', redirectTo: '' }` como fallback.

## Guards

_Sem guards enquanto não houver autenticação._ Se surgir autenticação, o contrato de auth vem **primeiro**
do backend (backend-first) e o guard consome o estado de auth via signal store.
