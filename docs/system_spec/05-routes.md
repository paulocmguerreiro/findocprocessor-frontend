# System Spec — 05: Rotas e Guards

> Actualizado automaticamente após cada Issue pela Fase 3 (documenta-issue).

## app.routes.ts (planeado)

```typescript
[
  { path: '',          loadComponent: () => import('./features/dashboard/...') },
  { path: 'documents', loadComponent: () => import('./features/documents/...') },
  { path: 'config',    loadComponent: () => import('./features/config/...') },
  { path: '**',        redirectTo: '' }
]
```

Todas as rotas são lazy-loaded via `loadComponent()`.

## Guards

_Nenhum guard planeado para v1.0 — aplicação sem autenticação._

_Vazio até à primeira issue implementada._
