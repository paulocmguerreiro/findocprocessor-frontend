# Padrão — Tema (cores light/dark)

> Este ficheiro é um **padrão**: onde acrescentar uma cor de domínio nova, e como funciona a
> alternância claro/escuro. Detalhe de build/dependências (Tailwind, Material): `06-config.md`.

## Onde vive

`src/styles/cores.scss` — paleta **"Frapuccine"**: Catppuccin Latte no claro, Catppuccin Frappé no
escuro. Uma custom property por cor de domínio, cada uma com o par claro/escuro resolvido por
`light-dark()`:

```scss
:root {
  color-scheme: light dark;

  --cor-fundo: light-dark(#eff1f5, #303446);
  --cor-texto: light-dark(#4c4f69, #c6d0f5);
  --cor-primaria: light-dark(#8839ef, #ca9ee6);
  --cor-destaque: light-dark(#1e66f5, #8caaee);
  --cor-sucesso: light-dark(#40a02b, #a6d189);
  --cor-perigo: light-dark(#d20f39, #e78284);
  --cor-aviso: light-dark(#df8e1d, #e5c890);
  --cor-sobre-primaria: light-dark(#eff1f5, #232634);
}
```

## Como a alternância chega ao ecrã (sem JS)

```
preferência do SO (prefers-color-scheme)
  → color-scheme: light dark   (:root = <html>, cores.scss)
  → light-dark(...) resolve --cor-*   (:root, cores.scss)
  → mat.theme($overrides) mapeia --cor-* → --mat-sys-*   (html, styles.scss)
  → body e componentes Material consomem --mat-sys-*
```

`color-scheme: light dark` no `:root` é o que ativa `light-dark()` — sem essa declaração a função fica
sempre presa ao primeiro valor. Não há `data-theme`, toggle nem store para isto: é resolvido pelo
browser antes de qualquer render, a partir da preferência do sistema operativo.

`src/styles.scss` liga a paleta ao Angular Material via `@include mat.theme($overrides: (...))` no
seletor `html`, mapeando cada token do Material (`primary`, `on-primary`, `surface`, ...) para a
`--cor-*` correspondente. Os componentes (próprios ou do Material) **nunca leem `--cor-*` diretamente**
— consomem sempre os tokens `--mat-sys-*` (ex.: `var(--mat-sys-surface)`), que é a API pública que o
mixin do Material expõe.

## Regras

- **Cor de domínio nova → acrescentar em `src/styles/cores.scss`**, sempre como par `light-dark(claro,
  escuro)`, nunca um valor único. Se a cor precisa de se refletir num token do Material (ex.: mais um
  estado semântico tipo "info"), acrescentar também a entrada correspondente no `$overrides` de
  `mat.theme()` em `src/styles.scss`.
- **Componentes consomem `--mat-sys-*`, não `--cor-*`** — a indireção existe para que qualquer
  componente Angular Material beneficie da paleta sem conhecer os nomes internos do projeto.
- Não introduzir `@media (prefers-color-scheme: dark)` a redefinir estas variáveis — duplicaria o que
  `light-dark()` já resolve nativamente.
- Não introduzir toggle de tema em JS/`localStorage` sem decisão explícita — o padrão atual segue
  sempre a preferência do sistema operativo.

## Tailwind

Utilitários Tailwind (`src/tailwind.css`) e este tema são camadas independentes — Tailwind não gera
nem consome `--cor-*`/`--mat-sys-*`. Se uma utility class e uma regra do tema colidirem, a ordem no
array `styles` do `angular.json` decide (`06-config.md`).
