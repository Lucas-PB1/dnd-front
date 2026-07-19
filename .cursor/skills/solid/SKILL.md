---
name: solid
description: SOLID principles applied to dnd-front FSD. Use when refactoring coupling, slice boundaries, or shared/api usage. Complements rule 03-solid.
disable-model-invocation: true
---

# SOLID — dnd-front (FSD)

| Princípio | No dnd-front |
| --------- | ------------ |
| **SRP**   | Um slice = uma responsabilidade de produto |
| **OCP**   | Estender via novo slice; não inchir `shared` |
| **LSP**   | Tipos em `entities/` estáveis para features |
| **ISP**   | `index.ts` exporta só API pública do slice |
| **DIP**   | Features usam `shared/api/` — não fetch inline |

## Exemplos

- Health: `shared/api/health/check-health.ts` — route `app/api/health` só chama e responde
- Catálogo: `features/*/api` usa `catalogFetch` / `gameFetch` de `shared/api/dnd-api`
- Auth: `features/auth` → `shared/api/supabase` (nunca `@supabase/supabase-js` em `model/`)

`features/*/model/` **não** importa `@supabase/supabase-js` direto.

Ver [reference.md](reference.md).
