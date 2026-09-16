# Plano 05 — Tipo `strikeOptions`

**ID:** FR-13 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`GET /combat-mechanical-catalog` inclui `strikeOptions` (`StrikeOptionDto`). `CombatMechanicalCatalog` no front **não tem** o campo.

## Fazer

Adicionar o tipo e o campo no catálogo. UI: plano 17.

## Pronto quando

O fetch tipado não descarta `strikeOptions`.

## Feito

`StrikeOption` + `strikeOptions` em `CombatMechanicalCatalog`. UI no plano 17.
