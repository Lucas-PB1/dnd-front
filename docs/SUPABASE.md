# Supabase

## 1. Criar projeto

1. [supabase.com/dashboard](https://supabase.com/dashboard) → New project
2. Settings → **API Keys** → copiar **Project URL** e **Publishable key** (`sb_publishable_...`)

## 2. Variáveis locais

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## 3. Verificar

```bash
pnpm dev
# GET http://localhost:3001/api/health — database: "ok"
```

## 4. Tipos do banco

```bash
pnpm dlx supabase gen types typescript --project-id <id> > src/shared/api/supabase/database.ts
```

## Código (FSD)

| Contexto       | Arquivo                         |
| -------------- | ------------------------------- |
| Browser        | `shared/api/supabase/client.ts` |
| Server / proxy | `shared/api/supabase/server.ts` |
| Login UI       | `features/auth/`                |
| Sessão cookies | `src/proxy.ts`                  |

## Divisão com dnd-api

- **Front:** login, signup, sessão, enviar JWT
- **API:** validar JWT (`SupabaseAuthGuard`), RLS no Postgres

Skills: `supabase-auth` · `supabase` · `dnd-api-contract/references/auth-flow.md`
