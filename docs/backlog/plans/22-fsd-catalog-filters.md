# Plano 22 — FSD nos filtros do catálogo

**ID:** FR-10 · **Dificuldade:** média · **Status:** Feito

## Gap

`shared/lib/catalog-filter-options.ts` importa `entities` (habilidades). Viola FSD.

## Fazer

Builders no slice de catálogo / entity ability. `shared` não sobe de camada. Pode antecipar 23–24 (filtros viram função, não constante).

## Pronto quando

Sem import `shared` → `entities`.

## Feito

`buildCatalogFilterField` em `shared/lib`. `buildAbilityFilter` e demais filtros do compêndio nas entities. `buildSpellSchoolFilter(schools)` e `buildFeatCategoryFilter(categories)` prontos para 23–24. Removido `shared/lib/catalog-filter-options.ts`.
