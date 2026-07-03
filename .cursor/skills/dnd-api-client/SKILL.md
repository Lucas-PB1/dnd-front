---
name: dnd-api-client
description: Cliente HTTP para dnd-api — catalogFetch, gameFetch, ApiError, NEXT_PUBLIC_API_URL. Use ao chamar endpoints ou tratar erros da API Nest.
---

# dnd-api client

## Código

`src/shared/api/dnd-api/`

| Módulo           | Uso                         |
| ---------------- | --------------------------- |
| `env.ts`         | `isDndApiConfigured()`      |
| `api-client.ts`  | `catalogFetch`, `gameFetch` |
| `api-error.ts`   | `ApiError`                  |
| `nest-health.ts` | health check                |

## Env

```env
NEXT_PUBLIC_API_URL=http://localhost:3000   # sem barra final
```

API :3000 · Next dev :3001

## Regras

1. **Catálogo**: `catalogFetch` — sem Bearer
2. **Game**: `gameFetch(path, accessToken)` — JWT Supabase
3. **Nunca** recalcular regras D&D no front
4. 401 → redirect login (`features/auth`)

## Contrato completo

Skill: `dnd-api-contract` · Swagger: `{API_URL}/api`

## Exemplo

```typescript
import { catalogFetch } from "@/shared/api/dnd-api/api-client";

const cls = await catalogFetch("/classes/fighter", {
  next: { revalidate: 3600 },
});
```
