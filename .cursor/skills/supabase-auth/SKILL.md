---
name: supabase-auth
description: Supabase Auth no dnd-front — login, signup, sessão, proxy, Bearer na API. Use ao implementar auth, proteger rotas ou integrar gameFetch com JWT.
---

# Supabase Auth — dnd-front

## O que o front faz

| Tarefa                   | Onde                          |
| ------------------------ | ----------------------------- |
| Login / signup / logout  | `features/auth/`              |
| Sessão + refresh cookies | `src/proxy.ts`                |
| Token nas rotas game     | `gameFetch(..., accessToken)` |
| Rotas protegidas UI      | `shared/lib/auth-routes.ts`   |

## O que o front NÃO faz

- Validar JWT (isso é **dnd-api**)
- Acessar Postgres de jogador direto (usar API)
- Usar `service_role` key

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

API irmã precisa de `SUPABASE_URL` + `FRONTEND_URL` (CORS).

## Fluxo

Ver [dnd-api-contract/references/auth-flow.md](../dnd-api-contract/references/auth-flow.md)

## Clientes

| Contexto | Arquivo                                    |
| -------- | ------------------------------------------ |
| Browser  | `shared/api/supabase/client.ts`            |
| Server   | `shared/api/supabase/server.ts`            |
| Proxy    | `src/proxy.ts` (inline createServerClient) |

## Dashboard Supabase

- Authentication → Providers → Email habilitado
- Dev: pode desativar "Confirm email"
- RLS: migrations na API (`P004_player_rls.sql`)

## Referência API (validação JWT)

`dnd-api/.cursor/skills/supabase-auth/` — guards Nest, JWKS, RLS

Docs: [docs/SUPABASE.md](docs/SUPABASE.md)
