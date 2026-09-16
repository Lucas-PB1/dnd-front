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

Métodos de atributo: `GET /ability-generation-methods` traz `slug` + `name` + `description` e as regras de geração (`pool` no conjunto padrão, `pointBuy` com budget/custos, totais da rolagem). O wizard usa isso no stepper; o POST `/characters` continua validando na API. Enquanto a query está pending ou vazia, o select usa fallback `standard-array` / `roll` / `point-buy`.

Classe: `GET /classes/:slug` inclui `subclassUnlockLevel` e `jackOfAllTradesLevel`; `GET /classes/:slug/progression` marca `asiOrFeat` por nível; `GET /classes/:slug/options` traz grupos `expertiseSkill*`. A ficha traz `jackOfAllTrades`; o inventário traz `attunementLimit`. O front não replica tabelas PHB desses valores.

Armas: `range` + `propertyDetails` + `mastery` (não `properties` bruto).

Mesa: `POST /characters/:id/rest` aceita `type: short | long | dawn`. `dawn` recarrega cargas/usos 1×/amanhecer (recursos de item) sem descanso longo.
