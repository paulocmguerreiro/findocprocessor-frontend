# Estrutura de Pastas de Features

Uma feature agrupa a UI de um domínio em `src/app/features/<feature>/`.

```
src/app/features/<feature>/
  <feature>.component.ts     # componente raiz da feature (standalone)
  <feature>.routes.ts        # rotas da feature (quando > 1 rota)
  components/                # subcomponentes só desta feature (quando ≥ 3)
    <sub>.component.ts
```

## Regras

- Componente com **< 3** subcomponentes próprios → ficam ficheiros soltos na pasta da feature, sem `components/`.
- A partir de **3** subcomponentes relacionados → criar `components/` para os agrupar. Reutilizar nomes já usados noutras features (dicionário de equivalência) em vez de sinónimos novos.
- Subcomponente usado por **mais que uma** feature → promover para `src/app/shared/components/`, não duplicar.
- Rotas lazy: cada feature carregada por `loadComponent()` em `app.routes.ts`; se a feature tem várias rotas internas, expõe-nas em `<feature>.routes.ts` e é carregada por `loadChildren()`.
- Estado partilhado da feature vive em `src/app/state/` (signal store), **não** dentro da pasta da feature.

## Posicionamento
- UI → `features/<feature>/`
- Estado partilhado → `state/`
- Acesso HTTP → `core/services/`
- Reutilizável transversal → `shared/`
