# Supabase

## 1. Criar projeto

1. [supabase.com/dashboard](https://supabase.com/dashboard) → New project
2. Settings → **API Keys** → copiar **Project URL** e **Publishable key** (`sb_publishable_...`)

> A chave legada `anon` foi substituída pela **publishable key**. Mesmos privilégios (RLS), formato novo.

## 2. Variáveis locais

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## 3. Verificar

```bash
pnpm dev
# GET http://localhost:3000/api/health
# database: "ok" quando Supabase estiver configurado
```

## 4. Tipos do banco (quando houver tabelas)

```bash
pnpm dlx supabase login
pnpm dlx supabase gen types typescript --project-id <id> > src/infrastructure/supabase/database.ts
```

## Clientes no código

| Contexto                      | Arquivo                         |
| ----------------------------- | ------------------------------- |
| Route Handler / Server Action | `createSupabaseServerClient()`  |
| Client Component              | `createSupabaseBrowserClient()` |

Sessão auth é renovada via `src/proxy.ts` (convenção Next.js 16+).
