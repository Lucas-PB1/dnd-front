---
name: typescript
description: TypeScript patterns for dnd-front strict mode. Use when typing APIs, entities, Zod schemas, or fixing type errors. Complements rule 01-typescript-strict.
disable-model-invocation: true
---

# TypeScript — dnd-front

## Strict

`tsconfig.json`: `strict: true` — manter sempre.

## Convenções

| Uso            | Preferência                        |
| -------------- | ---------------------------------- |
| Tipos API/DTO  | `type` em `entities/*/types.ts`    |
| Form / payload | `z.infer<typeof schema>` em `features/*/model` |
| Enum de status | `type` union (`"ok" \| "degraded"`) |

## Zod + tipos

```typescript
export const createCharacterSchema = z.object({ ... });
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
```

## Camadas sem React

`entities/` e `shared/lib` / `shared/api` não importam `react` (exceto UI em `shared/ui`).

## Evitar

- `any`, `@ts-ignore`
- `as Foo` sem narrowing ou validação Zod prévia
- Duplicar tipo manualmente quando `z.infer` resolve
- Campos de contrato removidos na API (`featSlugs`, `weapon.properties` bruto)

Ver [reference.md](reference.md).
