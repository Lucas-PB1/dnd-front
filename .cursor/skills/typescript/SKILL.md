---
name: typescript
description: TypeScript patterns for dnd strict mode. Use when typing APIs, domain ports, Zod schemas, generics, or fixing type errors. Complements rule 01-typescript-strict.
disable-model-invocation: true
---

# TypeScript — dnd

## Strict

`tsconfig.json`: `strict: true` — manter sempre.

## Convenções

| Uso             | Preferência                         |
| --------------- | ----------------------------------- |
| Repository port | `interface` em `domain/`            |
| DTO / response  | `type` ou `z.infer<typeof schema>`  |
| Enum de status  | `type` union (`"ok" \| "degraded"`) |

## Zod + tipos

```typescript
export const healthResponseSchema = z.object({ ... });
export type HealthResponse = z.infer<typeof healthResponseSchema>;
```

## Camadas sem React

`domain/` e `application/` não importam `react` nem `@supabase/*`.

## Evitar

- `any`, `@ts-ignore`
- `as Foo` sem narrowing ou validação Zod prévia
- Duplicar tipo manualmente quando `z.infer` resolve

Ver [reference.md](reference.md) para exemplos do módulo health.
