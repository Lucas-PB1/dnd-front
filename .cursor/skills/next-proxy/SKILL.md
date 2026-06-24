---
name: next-proxy
description: Next.js 16 proxy for Supabase session refresh. Use when editing src/proxy.ts, auth cookies, or session middleware — never middleware.ts.
disable-model-invocation: true
---

# Next.js 16 — Proxy

## Arquivo

`src/proxy.ts` — export `proxy(request: NextRequest)`, **não** `middleware.ts`.

## Responsabilidade

Renovar sessão Supabase em cada request via `createServerClient` + `supabase.auth.getUser()`.

## Env

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)

## Matcher

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Sem Supabase configurado

`isSupabaseConfigured()` → `NextResponse.next()` sem tentar auth.

## Referência

Ver implementação atual em `src/proxy.ts`.
