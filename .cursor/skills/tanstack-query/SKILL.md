---
name: tanstack-query
description: TanStack Query for dnd — hooks, query keys, providers, fetching /api routes. Use when adding data fetching, mutations, cache, or editing presentation/hooks.
disable-model-invocation: true
---

# TanStack Query — dnd

## Setup

- `lib/query-client.ts` — factory do QueryClient
- `presentation/providers/query-provider.tsx` — `QueryClientProvider`
- Envolvido em `AppProviders` no root layout

## Padrão por feature

```text
presentation/hooks/<feature>.api.ts   → keys + fetch
presentation/hooks/use-<feature>.ts     → useQuery
```

## Exemplo health

```typescript
// health.api.ts
export const healthKeys = { all: ["health"] as const };
export async function fetchHealth(): Promise<HealthResponse> { ... }

// use-health.ts
useQuery({ queryKey: healthKeys.all, queryFn: fetchHealth });
```

## Regras

- Fetch para `/api/*`, não Supabase direto (regra de negócio no backend)
- Keys centralizadas no mesmo arquivo do fetch
- Tipos de `@/application/*/schema`
