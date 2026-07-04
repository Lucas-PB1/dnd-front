# Integração com dnd-api

Frontend **dnd-front** (FSD) consome a API Nest no repo irmão **`dnd-api`**.

## Código

```text
src/shared/api/dnd-api/         # catalogFetch, gameFetch
src/features/class-catalog/     # catálogo (sem auth)
src/features/species-catalog/
src/features/background-catalog/
src/features/spell-catalog/
src/features/characters/        # listagem e detalhe (gameFetch + JWT)
src/features/create-character/  # POST /characters
src/features/auth/              # sessão Supabase
```

Skills: `dnd-api-client` · `dnd-api-contract` · `supabase-auth`

## Fichas de personagem

Criação e leitura via API — sem dados PHB locais no front.

- **Criar:** `/characters/new` → `POST /characters` (nome, nível, classe, espécie, antecedente, subclasse)
- **Listar / detalhe:** `/characters`, `/characters/[id]` → `GET /characters`

Regras de jogo (PV, PB, validação de subclasse por nível, etc.) ficam na **dnd-api**.

Roadmap da ficha completa: [CHARACTER-SHEET-PLAN.md](./CHARACTER-SHEET-PLAN.md)
