---
name: dry
description: DRY patterns for dnd — single source of truth for Zod schemas, query keys, and shared logic. Use when duplicating validation, types, or API shapes. Complements rule 04-dry.
disable-model-invocation: true
---

# DRY — dnd

## Zod — uma fonte

- Schema em `application/<feature>/*.schema.ts`
- Route e form importam o **mesmo** schema
- Tipo via `z.infer` — não duplicar manualmente

## Query keys

```typescript
// presentation/hooks/health.api.ts
export const healthKeys = { all: ["health"] as const };
```

## Quando extrair

- 1ª repetição: tolerável se pequena
- 2ª: considerar extrair
- 3ª: extrair para `lib/` ou helper compartilhado

## Não forçar DRY

Dois use cases similares mas com regras diferentes → manter separados (SRP &gt; DRY).

Ver [reference.md](reference.md).
