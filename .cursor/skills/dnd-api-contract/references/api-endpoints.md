# Endpoints — referência rápida

Base: `NEXT_PUBLIC_API_URL` · Swagger: `{API}/api`

Fonte canônica: `dnd-api/.cursor/skills/api-consumer-next/references/api-endpoints.md`

## Catálogo (sem auth)

| Método | Path                                                                                                                                     |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`                                                                                                                                |
| GET    | `/classes`, `/classes/:slug`                                                                                                             |
| GET    | `/classes/:slug/subclasses`, `/subclasses/:slug`, `/subclasses/:slug/options`, `/subclasses/:slug/mechanics`, `/subclasses/:slug/spells` |
| GET    | `/classes/:slug/spells`, `/classes/:slug/spell-slots`, `/classes/:slug/equipment`, `/classes/:slug/skills`                               |
| GET    | `/species`, `/species/:slug`, `/species/:slug/traits`, `/species/:slug/trait-choices`                                                    |
| GET    | `/backgrounds`, `/backgrounds/:slug`, `/backgrounds/:slug/equipment`                                                                     |
| GET    | `/spells`, `/spells/:slug`                                                                                                               |
| GET    | `/feats`, `/feats/:slug`, `/feats/:slug/options`                                                                                         |
| GET    | `/skills`, `/skills/:slug`                                                                                                               |
| GET    | `/abilities`                                                                                                                             |
| GET    | `/weapons`, `/weapons/:slug`, `/armor`, `/armor/:slug`                                                                                   |
| GET    | `/items`, `/items/:slug`                                                                                                                 |
| GET    | `/alignments`, `/languages`, `/character-levels`                                                                                         |
| GET    | `/ability-generation-methods` (catálogo PHB; wizard do front usa enum local e **não** consome este endpoint)                             |
| GET    | `/subclasses` (lista paginada do compêndio)                                                                                              |

## Game (Bearer JWT Supabase)

| Método                | Path                                                           |
| --------------------- | -------------------------------------------------------------- |
| GET/POST/PATCH/DELETE | `/characters`, `/characters/:id`                               |
| POST                  | `/characters/roll-abilities`                                   |
| GET/POST              | `/characters/:id/level-up/preview`, `/characters/:id/level-up` |
| GET/POST/PATCH/DELETE | `/characters/:id/inventory`, `.../inventory/:itemSlug`         |
| GET/PATCH             | `/characters/:id/state`                                        |
| POST                  | `/characters/:id/spells/cast`, `/characters/:id/rest`          |

## Slugs

Inglês no seed (`fighter`, `wizard`). Exibição PT no JSON (`name`).

## Exemplo catálogo (RSC)

```typescript
import { catalogFetch } from "@/shared/api/dnd-api/api-client";

const fighter = await catalogFetch("/classes/fighter", {
  next: { revalidate: 3600 },
});
```

## Exemplo game (client)

```typescript
import { gameFetch } from "@/shared/api/dnd-api/api-client";

const list = await gameFetch("/characters", accessToken);
```
