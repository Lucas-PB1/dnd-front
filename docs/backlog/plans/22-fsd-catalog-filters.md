# Plano 22 — FSD nos filtros do catálogo

**ID:** FR-10 · **Dificuldade:** média · **Status:** Ready

## Gap

`shared/lib/catalog-filter-options.ts` importa `entities` (habilidades). Viola FSD.

## Fazer

Builders no slice de catálogo / entity ability. `shared` não sobe de camada. Pode antecipar 23–24 (filtros viram função, não constante).

## Pronto quando

Sem import `shared` → `entities`.
