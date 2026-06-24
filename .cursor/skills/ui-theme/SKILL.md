---
name: ui-theme
description: Taverna/Masmorra theme for dnd — globals.css tokens, next-themes, dark mode, Heroicons. Use when styling pages, theme toggle, or color tokens.
disable-model-invocation: true
---

# Tema — Taverna / Masmorra

## Tokens

Definidos em `src/app/globals.css` — variáveis CSS (`--primary`, `--background`, etc.).

Usar classes Tailwind semânticas: `bg-background`, `text-foreground`, `border-border`.

## Dark mode

- `next-themes` via `presentation/providers/theme-provider.tsx`
- `ThemeToggle` em `presentation/components/theme-toggle.tsx`
- `suppressHydrationWarning` no `<html>` do layout

## Ícones

Heroicons no app: `@heroicons/react/24/outline`

## Cores

Paleta documentada em [docs/COLORS.md](docs/COLORS.md)

## Evitar

`#hex` ou `rgb()` hardcoded em componentes — usar tokens.
