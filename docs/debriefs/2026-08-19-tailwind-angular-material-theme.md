# Debrief: Tema Angular Material + Tailwind CSS v4 com paleta light/dark

**Issue:** — (implementado por exploração direta fora do ciclo `/cria-issue` → `/planeia-issue`;
documentado retroativamente a pedido do utilizador)
**Branch:** chore/tailwind-angular-material-theme
**Data:** 2026-08-19
**Commits:** 1

## O que foi implementado

Base visual do projeto: **Angular Material** instalado e temado via `mat.theme()` (paleta `violet`/`blue`,
`theme-type: color-scheme`), com os tokens de cor (`primary`, `surface`, `on-surface`, ...) sobrepostos
(`$overrides`) a **custom properties próprias do projeto** (`--cor-primaria`, `--cor-fundo`, ...) definidas
em `src/styles/cores.scss` — paleta "Frapuccine" (Catppuccin Latte no claro, Catppuccin Frappé no escuro).
A alternância claro/escuro é feita **sem JavaScript**: `color-scheme: light dark` no `:root` + a função CSS
nativa `light-dark()` resolvem o par de cores conforme a preferência do sistema operativo
(`prefers-color-scheme`). **Tailwind CSS v4** instalado via `@tailwindcss/postcss` (`.postcssrc.json`) e
ligado como stylesheet global (`src/tailwind.css`) no `angular.json`. `index.html` passa a carregar a
fonte Roboto e o pacote de ícones Material Icons via Google Fonts.

## Ficheiros alterados

| Ficheiro | Tipo de alteração | Notas |
| -------- | ----------------- | ----- |
| `package.json` / `package-lock.json` | alterado | dependencies: `@angular/material` (`^22.1.2`), `@angular/cdk` (`^22.1.2`); devDependencies: `tailwindcss` (`^4.1.12`), `@tailwindcss/postcss` (`^4.1.12`), `postcss` (`^8.5.3`) |
| `.postcssrc.json` | novo | regista o plugin `@tailwindcss/postcss` |
| `src/tailwind.css` | novo | `@import "tailwindcss";` — ponto de entrada único do Tailwind |
| `angular.json` | alterado | target `build` → `styles`: `["src/tailwind.css", "src/styles.scss"]` (Tailwind primeiro, para o Material/tema poderem sobrepor-se) |
| `src/styles/cores.scss` | novo | paleta "Frapuccine" — 8 custom properties (`--cor-fundo`, `--cor-texto`, `--cor-primaria`, `--cor-destaque`, `--cor-sucesso`, `--cor-perigo`, `--cor-aviso`, `--cor-sobre-primaria`) via `light-dark()`, `color-scheme: light dark` no `:root` |
| `src/styles.scss` | alterado | `@use "./styles/cores"`; `@include mat.theme(...)` no `html` com `$overrides` a ligar os tokens do Material às `--cor-*`; `body` passa a consumir `--mat-sys-surface`/`--mat-sys-on-surface`/`--mat-sys-body-medium` |
| `src/index.html` | alterado | `<link>` de `preconnect` + folha de estilo Google Fonts (Roboto 300/400/500, Material Icons); reformatado (indentação/aspas duplas) |

## Decisões tomadas

| Decisão | Alternativa considerada | Porquê esta |
| ------- | ----------------------- | ----------- |
| Paleta própria (`--cor-*`) sobreposta ao Material via `$overrides`, em vez de usar diretamente as paletas nativas `mat.$violet-palette`/`mat.$blue-palette` | Deixar o Material gerar as suas cores sem override | Dá controlo total sobre os valores exatos de claro/escuro (Catppuccin Latte/Frappé) sem ficar preso à escala tonal do Material 3; os tokens do Material continuam a existir (`--mat-sys-*`) e a propagar-se aos componentes, só a origem do valor é que passa a ser nossa |
| Alternância light/dark via `color-scheme` + `light-dark()` nativos (CSS puro) | `@media (prefers-color-scheme: dark)` a redefinir cada variável, ou um `data-theme` + JS/toggle | Sem duplicação de blocos de regras, sem JS, resolve-se no browser antes de qualquer render; `theme-type: color-scheme` no `mat.theme()` foi escolhido a par, para o próprio Material also resolver por `color-scheme` em vez de gerar dois temas estáticos |
| `tailwind.css` como stylesheet **separado**, antes de `styles.scss` no array `styles` do `angular.json` | Um único `styles.scss` com `@import` do Tailwind lá dentro | Mantém o Tailwind (utilitários) e o tema do Material/paleta (design tokens) como camadas independentes; ordem no array garante que as regras do Material (mais específicas/depois) podem sobrepor-se a utilitários base do Tailwind quando colidirem |
| Fontes carregadas por `<link>` no `index.html` (Google Fonts CDN) | Self-host das fontes (`@font-face` local, sem CDN externo) | Consistente com o setup por omissão gerado pelo schematic `ng add @angular/material`; sem requisito de offline-first ou de minimizar pedidos externos documentado para este projeto |

## Desvios ao Plano

Não há Plano formal — esta issue foi implementada por exploração direta (fora de `/planeia-issue` /
`/implementa-plano`), a pedido explícito do utilizador, e documentada retroativamente correndo apenas a
Fase 3a (`/documenta-implementacao`) sobre o código já existente no branch.

## Aprendizagens

**`light-dark()` + `color-scheme: light dark` substitui por completo a necessidade de um "dark mode
toggle" em JS para o caso de uso mais comum (seguir a preferência do SO).** A função `light-dark(claro,
escuro)` só resolve um valor quando o `color-scheme` computado do elemento inclui os dois esquemas — é
esse `color-scheme: light dark` no `:root` que liga o mecanismo; sem ele, `light-dark()` fica sempre no
primeiro valor. Isto significa que toda a alternância de tema deste projeto vive em CSS estático, herdado
por custom properties a partir do `<html>` — nenhum componente, store ou serviço precisa de saber que o
tema existe.

**`mat.theme($overrides: (...))` não substitui a paleta do Material — cria uma segunda camada de tokens
por cima.** Cada chave do `$overrides` (ex.: `primary: var(--cor-primaria)`) redefine o valor de
`--mat-sys-primary` para apontar para a nossa variável, mas os `--mat-sys-*` continuam a existir como a
API pública que os componentes Material realmente consomem — o efeito só se propaga porque `body`/
componentes leem `--mat-sys-*`, nunca `--cor-*` diretamente. É uma indireção deliberada: qualquer
componente Angular Material (não só os nossos) beneficia automaticamente da paleta sem precisar de
conhecer `--cor-*`.

**`@use` de um partial Sass com regras CSS "soltas" (não só variáveis) emite essas regras no output —
não é só um mecanismo de namespacing.** `@use "./styles/cores"` traz o bloco `:root { ... }` de
`cores.scss` para o CSS final compilado a partir de `styles.scss`, na posição de dependência (antes do
ponto de uso), tal como `@import` faria — a diferença de `@use` é só o namespacing de variáveis/mixins/
funções, não a emissão de regras CSS.

## SYSTEM_SPEC a atualizar

- `docs/system_spec/06-config.md` — secção nova "Tema (Angular Material + Tailwind)": dependências,
  `.postcssrc.json`, ordem no array `styles` do `angular.json`, fontes carregadas em `index.html`.
- `docs/system_spec/02-shared/tema-cores.md` (novo) — padrão de paleta light/dark (`cores.scss`,
  `color-scheme` + `light-dark()`, `$overrides` do `mat.theme()`) para reutilização por features futuras
  que precisem de novas cores de domínio.
- `docs/system_spec/00-index.md` — linha nova em "Shared" para `tema-cores.md`.

## Verificação final

- [x] Linter a verde — `ng lint`
- [x] Testes a verde — `ng test --coverage --watch=false` (24 testes, 100% cobertura, limiares 95% cumpridos)
- [x] Build de produção a verde — `ng build --configuration=production`
- [x] Nenhum dado sensível em logs
- [x] Nenhum segredo em código
