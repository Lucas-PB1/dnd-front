---
name: dry
description: DRY patterns for dnd-front — single source of truth for Zod schemas, query keys, and shared logic. Use when duplicating validation, types, or API shapes. Complements rule 04-dry.
disable-model-invocation: true
---

# DRY — dnd-front

## Zod — uma fonte

- Schema em `features/<feature>/model/*.schema.ts`
- Form e `toPayload` importam o **mesmo** schema
- Tipo via `z.infer` — não duplicar manualmente

## Query keys

```typescript
// features/feat-catalog/api/feats.api.ts
export const featKeys = {
  all: ["feats"] as const,
  listPage: (params) => [...featKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...featKeys.all, "detail", slug] as const,
};
```

Mechanics de subclass: uma key (`subclassKeys.mechanics` em class-catalog) — não duplicar em subclass-catalog.

## Quando extrair

- 1ª repetição: tolerável se pequena
- 2ª: considerar extrair
- 3ª: extrair para `shared/lib/` ou entity helper

## Não forçar DRY

Dois fluxos similares com regras diferentes → manter separados (SRP &gt; DRY).

Ver [reference.md](reference.md).
