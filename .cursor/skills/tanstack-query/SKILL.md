---
name: tanstack-query
description: TanStack Query for dnd-front — hooks in features/*/api or widgets/*/api.
disable-model-invocation: true
---

# TanStack Query

## Provider

`app/providers/query-provider.tsx`

## Padrão FSD

```text
features/<nome>/api/<nome>.api.ts   → query keys + fetch
features/<nome>/api/use-<nome>.ts   → useQuery / useMutation
```

Exemplos: `features/class-catalog/api/`, `features/characters/api/`, `widgets/system-status/api/`

## Regras

- Catálogo: `catalogFetch` + `staleTime` longo (1h)
- Game: `gameFetch` + token de `features/auth`
- 401: redirect login

Skill: `dnd-api-client`
