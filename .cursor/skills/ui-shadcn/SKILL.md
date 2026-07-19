---
name: ui-shadcn
description: shadcn/ui base-nova components for dnd. Use when adding UI primitives, field/input/label/button, or running shadcn CLI.
disable-model-invocation: true
---

# shadcn/ui — dnd

## Base instalada

`field` · `input` · `label` · `button` · `separator` em `src/components/ui/`

## Adicionar componente

```bash
pnpm dlx shadcn@latest add <nome>
```

Config: `components.json` — aliases `@/components`, `@/lib/utils`.

## Uso com forms

Combinar `Field`, `FieldError`, `Input`, `Label` com RHF (skill `forms-rhf-zod`).

## Estilo

Usar tokens semânticos (`bg-primary`, `text-muted-foreground`) — ver skill `ui-theme`.

Ícones do app: **Heroicons** (`@heroicons/react/24/outline`) — skill `ui-icons`.  
Compêndio (BackLink, CatalogPageHeader, PhbProse): skill `ui-catalog`.

Lucide pode vir com componentes shadcn; **não** importar Lucide em features.
