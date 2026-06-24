---
name: forms-rhf-zod
description: React Hook Form + Zod resolver for dnd forms. Use when building forms with validation, Field/FieldError integration, or sharing schemas with API routes.
disable-model-invocation: true
---

# Forms — RHF + Zod

## Stack

- `react-hook-form`
- `@hookform/resolvers/zod`
- Schemas em `application/*/schema.ts` (mesma fonte da API — DRY)

## Padrão

```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(mySchema),
});
```

## UI

```tsx
<Field>
  <Label htmlFor="name">Nome</Label>
  <Input id="name" {...register("name")} />
  <FieldError>{errors.name?.message}</FieldError>
</Field>
```

## Submit

Server Action ou `fetch("/api/...")` — validar de novo no servidor com o mesmo Zod schema.

## Tipos

`z.infer<typeof mySchema>` — não duplicar interface manual.
