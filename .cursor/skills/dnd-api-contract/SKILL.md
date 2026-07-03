---
name: dnd-api-contract
description: Contrato REST da API Nest dnd-api — endpoints catálogo e game, slugs, erros, auth Bearer. Use ao integrar features, tipar respostas ou consultar rotas disponíveis.
---

# Contrato dnd-api

Repo da API: **`dnd-work/dnd-api/`** (NestJS + Postgres PHB 2024).

## Env no front

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Swagger local: `{API_URL}/api`

## Divisão catálogo vs game

| Tipo     | Auth   | Exemplos                               |
| -------- | ------ | -------------------------------------- |
| Catálogo | Nenhum | `/classes`, `/spells`, `/species`      |
| Game     | Bearer | `/characters`, `/characters/:id/state` |

## Regras de integração

1. Slugs em inglês no banco (`fighter`, `dwarf`) — nomes PT no campo `name`
2. Erros JSON: `{ statusCode, message, path, timestamp }`
3. **Nunca** recalcular HP, PB, spell slots, proficiency no front
4. Catálogo: `catalogFetch` em RSC ou TanStack Query
5. Game: `gameFetch(path, session.access_token)`

## Referências

- [api-endpoints.md](references/api-endpoints.md) — tabela completa de rotas
- [auth-flow.md](references/auth-flow.md) — JWT Supabase → API
- [errors.md](references/errors.md) — tratamento no front

## Skills relacionadas (repo API)

No `dnd-api/.cursor/skills/`: `cqrs-catalog-vs-game`, `nest-phb-api`, `supabase-auth`

## Plano mestre

`dnd-api/docs/rpg-web-plan.md` · `dnd-api/docs/product-roadmap.md`
