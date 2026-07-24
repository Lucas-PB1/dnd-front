---
name: dnd-api-contract
description: Contrato REST e cliente HTTP da dnd-api — endpoints, catalogFetch/gameFetch, erros, auth. Use ao integrar features ou tipar respostas.
---

# Contrato + client dnd-api

Repo API: **`dnd-work/dnd-api/`**. Swagger: `{API_URL}/api`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Catálogo vs game

| Tipo | Auth | Client |
|------|------|--------|
| Catálogo | Nenhum | `catalogFetch` |
| Game | Bearer | `gameFetch(path, accessToken)` |

Código: `src/shared/api/dnd-api/` (`api-client.ts`, `api-error.ts`, `env.ts`)

## Regras

1. Slugs EN no path (`fighter`); `name` em PT
2. Erros: `{ statusCode, message, path, timestamp }` — 401 → login
3. **Nunca** recalcular HP, PB, spell slots no front
4. Catálogo: RSC ou TanStack Query; game: token de `features/auth`

## Referências

- [api-endpoints.md](references/api-endpoints.md)
- [auth-flow.md](references/auth-flow.md)
- [errors.md](references/errors.md)

## Exemplo

```typescript
import { catalogFetch } from "@/shared/api/dnd-api/api-client";

const cls = await catalogFetch("/classes/fighter", {
  next: { revalidate: 3600 },
});
```
