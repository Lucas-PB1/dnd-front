---
name: next-api
description: Route Handlers and API patterns for dnd Next.js 16 app. Use when creating or editing src/app/api, REST endpoints, Zod validation in routes, or TanStack Query consumers of /api.
disable-model-invocation: true
---

# Next.js — Route Handlers

## Padrão dnd

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const health = await getHealthStatus(healthRepository);
  return Response.json(toHealthResponse(health));
}
```

1. Validar body/query com Zod (POST/PUT)
2. Chamar use case em `application/`
3. Mapear com `to*Response()` do schema
4. `Response.json()` ou status de erro

## DI

Importar repos de `@/infrastructure/di` — não instanciar Supabase na route.

## Erros

- 400: validação Zod falhou
- 500: log + mensagem genérica (sem vazar stack)

## Client

TanStack Query em `presentation/hooks/` faz `fetch("/api/...")` — não chamar Supabase direto para regras de negócio.

Exemplo: `health.api.ts` + `useHealth()`.
