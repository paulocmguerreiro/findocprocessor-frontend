# Routing

- Lazy loading por rota via `loadComponent()` em `src/app/app.routes.ts` — **todas** as rotas de feature são lazy.
- Uma feature expõe as suas rotas em `<feature>.routes.ts` quando tem mais que uma rota.
- `{ path: '**', redirectTo: '' }` como fallback.
- Sem guards em v1.0 — a aplicação não tem autenticação. Se surgir autenticação, o contrato de auth vem primeiro do backend (backend-first).

Ver `docs/system_spec/05-routes/`.

```ts
export const routes: Routes = [
  { path: '',          loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'documents', loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent) },
  { path: 'config',    loadComponent: () => import('./features/config/config.component').then(m => m.ConfigComponent) },
  { path: '**', redirectTo: '' },
];
```
