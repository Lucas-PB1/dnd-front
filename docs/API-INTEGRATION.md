# Integração com dnd-api

Frontend **dnd-front** (FSD) consome a API Nest no repo irmão **`dnd-api`**.

## Código

```text
src/shared/api/dnd-api/                      # catalogFetch, gameFetch
src/features/catalog/*-catalog/              # catálogo PHB (sem auth)
src/features/character/characters/           # listagem de fichas
src/features/character/character-sheet/      # detalhe / edição / mesa
src/features/character/create-character/     # wizard → POST /characters
src/features/campaign/campaigns/             # mesas / encontros
src/features/auth/                           # sessão Supabase
```

Skills: `dnd-api-client` · `dnd-api-contract` · `supabase-auth`

## Fichas de personagem

| UI             | Rota front                                | API                                                      |
| -------------- | ----------------------------------------- | -------------------------------------------------------- |
| Criar          | `/characters/new`                         | `POST /characters`                                       |
| Listar         | `/characters`                             | `GET /characters`                                        |
| Detalhe / mesa | `/characters/[id]` → `CharacterSheetView` | `GET/PATCH /characters/:id` + session/inventory/level-up |

Regras de jogo (PV, PB, validação de subclasse, feats) ficam na **dnd-api**.

Talentos: payload/resposta usam **`characterFeats`** + **`featOptions`**.

Métodos de atributo: `GET /ability-generation-methods` (`slug` + `name` + `description`). O wizard (`ability-generation-fields.tsx`) e o review (`useStepReview`) **consomem** esse catálogo para labels do select. Enquanto a query está pending ou vazia, o select usa fallback `standard-array` / `roll` / `point-buy`. O schema Zod do create ainda valida esses três slugs; custos de point-buy continuam locais ([plano 29](./backlog/plans/29-point-buy-ssot.md)).

Armas: `range` + `propertyDetails` + `mastery` (não `properties` bruto).
