# Deploy (front)

O guia completo (API + front + Supabase) está em [`dnd-api/docs/DEPLOY.md`](../../dnd-api/docs/DEPLOY.md).

## Variáveis na Vercel (`dnd-front`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_API_URL=https://sua-api.vercel.app
```

**Root Directory:** `dnd-front` · **Package manager:** pnpm

Após o deploy, atualize `FRONTEND_URL` na API e as redirect URLs no Supabase Auth.
