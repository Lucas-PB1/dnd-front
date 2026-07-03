---
name: forms-rhf-zod
description: React Hook Form + Zod in dnd-front feature slices.
disable-model-invocation: true
---

# Forms — RHF + Zod

- Schemas em `features/<nome>/model/*.schema.ts`
- UI em `features/<nome>/ui/`
- `zodResolver` de `@hookform/resolvers/zod`
- Componentes: `shared/ui/field`, `input`, `button`

Exemplo: `features/auth/model/credentials.schema.ts`

Skill: `ui-shadcn`
