# DRY — exemplos

## Schema único no wizard

```typescript
// features/create-character/model/create-character.schema.ts
export const createCharacterSchema = z.object({ ... });

// steps + to-create-payload importam o mesmo schema / tipo inferido
```

## Health keys (widget)

```typescript
// widgets/system-status/api/…
export const healthKeys = { all: ["health"] as const };
```

## Tipos subclass

Canônicos em `entities/subclass/types.ts`; `entities/class/types` **reexporta** — não copiar campos.
