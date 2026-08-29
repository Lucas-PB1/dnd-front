# Design System — Grimoire

Camada visual reutilizável do **dnd-front**. Vive em `src/shared/design-system/` (FSD `shared`).

**Import preferido (novo código):**

```ts
import { Button } from "@/shared/design-system/primitives/button";
import { CatalogPageHeader } from "@/shared/design-system/patterns/catalog-page-header";
import { contentWidthClass } from "@/shared/design-system/tokens/layout";
```

**Compatibilidade:** `@/shared/ui/*` reexporta tudo — imports antigos continuam válidos.

Documentação completa: [`docs/DESIGN-SYSTEM.md`](../../docs/DESIGN-SYSTEM.md) · cores: [`docs/COLORS.md`](../../docs/COLORS.md).

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `tokens/` | Motion, larguras de layout (`contentWidthClass`) |
| `primitives/` | shadcn / Base UI — Button, Input, Dialog, Field… |
| `layout/` | PageMain, AppPageShell, BackLink |
| `brand/` | Atmosphere, SealMark, MarginCorner |
| `patterns/` | Compêndio, prose PHB, tiles, empty state, badges |

## shadcn CLI

`components.json` aponta novos primitivos para `src/shared/design-system/primitives/`.

```bash
cd dnd-front
pnpm dlx shadcn@latest add badge
```

## O que **não** entra aqui

- Cards de domínio (`class-card`, `spell-card`…) → `features/catalog/`
- Ficha Beyond (`beyond-panel`, combat panels) → `features/character/character-sheet/`
- Widgets de página (`app-header`, `catalog-shell`) → `widgets/`
