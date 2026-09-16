# Plano 02 — `minTraitTakes`

**ID:** FR-33 · **Dificuldade:** fácil · **Status:** Feito (2026-09-16)

## Gap

Front já tipava `minTraitTakes`. O JSON do `GET /combat-mechanical-catalog` já manda (`mapEconomyActions`). O Swagger `ClassEconomyActionDto` omitia o campo.

## Feito

Campo no DTO Nest (Swagger = JSON). Comentário no tipo do front. Filtro na aba Ações permanece (`matchesHeritageTraitAction`).
