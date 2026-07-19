# Integração com dnd-api

Frontend **dnd-front** (FSD) consome a API Nest no repo irmão **`dnd-api`**.

## Código

```text
src/shared/api/dnd-api/           # catalogFetch, gameFetch
src/features/*-catalog/           # catálogo PHB (sem auth)
src/features/characters/          # listagem de fichas
src/features/character-sheet/     # detalhe / edição / mesa (CharacterSheetView)
src/features/create-character/    # wizard → POST /characters
src/features/auth/                # sessão Supabase
```

Skills: `dnd-api-client` · `dnd-api-contract` · `supabase-auth`

## Fichas de personagem

| UI | Rota front | API |
|----|------------|-----|
| Criar | `/characters/new` | `POST /characters` |
| Listar | `/characters` | `GET /characters` |
| Detalhe / mesa | `/characters/[id]` → `CharacterSheetView` | `GET/PATCH /characters/:id` + session/inventory/level-up |

Regras de jogo (PV, PB, validação de subclasse, feats) ficam na **dnd-api**.

Talentos: payload/resposta usam **`characterFeats`** + **`featOptions`**.

Métodos de atributo no wizard: enum local (`standard-array` / `roll` / `point-buy`); a API ainda expõe `GET /ability-generation-methods`, mas o front **não** consome esse catálogo.

Armas: `range` + `propertyDetails` + `mastery` (não `properties` bruto).

Roadmap da ficha: [CHARACTER-SHEET-PLAN.md](./CHARACTER-SHEET-PLAN.md)
