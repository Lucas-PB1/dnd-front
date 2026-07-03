# Integração com dnd-api

Frontend **dnd-front** (FSD) consome a API Nest no repo irmão **`dnd-api`**.

## Código

```text
src/shared/api/dnd-api/       # catalogFetch, gameFetch
src/features/class-catalog/   # catálogo (sem auth)
src/features/characters/      # fichas (gameFetch + JWT)
src/features/auth/            # sessão Supabase
```

Skills: `dnd-api-client` · `dnd-api-contract` · `supabase-auth`

## Wizard de ficha

`src/features/character-sheet/` + `src/entities/character-sheet/` — dados locais JSON (migração futura para API).
