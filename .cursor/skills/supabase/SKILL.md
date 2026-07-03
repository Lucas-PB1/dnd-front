---
name: supabase
description: Supabase clients and env in dnd-front (shared/api/supabase). Use for database types, server/browser clients, env validation — not for login UI (see supabase-auth).
disable-model-invocation: true
---

# Supabase — clientes (dnd-front)

Auth UI e fluxo: skill **`supabase-auth`**.

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_...
```

## Clientes

| Contexto                      | Arquivo                         |
| ----------------------------- | ------------------------------- |
| Server (Route, Action, proxy) | `shared/api/supabase/server.ts` |
| Browser                       | `shared/api/supabase/client.ts` |
| Config check                  | `shared/api/supabase/env.ts`    |

## Tipos

`shared/api/supabase/database.ts` — gerar com CLI Supabase.

## Divisão de responsabilidade

| Supabase              | Front             | API (dnd-api) |
| --------------------- | ----------------- | ------------- |
| Auth (login)          | ✅ features/auth  | valida JWT    |
| Postgres catálogo PHB | —                 | ✅ TypeORM    |
| Postgres jogador      | —                 | ✅ + RLS      |
| Health check local    | opcional via repo | —             |

`features/` e `entities/` **não** importam `@supabase/*` diretamente — usar `shared/api/supabase` ou hooks em `features/auth`.

Docs: [docs/SUPABASE.md](docs/SUPABASE.md)
