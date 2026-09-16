# Plano 24 — Filtros: categorias de item/feat/arma

**ID:** FR-34 · **Dificuldade:** média · **Status:** Blocked · **Depende:** 22 (FSD)

## Gap

`FEAT_CATEGORY_FILTER`, `WEAPON_CATEGORY_FILTER`, `ARMOR_CATEGORY_FILTER`, `ITEM_TYPE_LABELS_PT` hardcoded. Seeds na API; listagens filtram por query, **não** expõem o enum/catálogo de labels.

## Fazer

Endpoints ou campo de referência na API. Front só mapeia slug→label da resposta. Um PR por família se a API vier fatiada (feats vs weapons).

## Pronto quando

Labels de categoria não vivem em Record estático no front.
