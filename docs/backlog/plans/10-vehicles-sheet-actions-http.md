# Plano 10 — HTTP `vehicles/sheet-actions`

**ID:** FR-18 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`POST /characters/:id/vehicles/sheet-actions` existe (leme, métricas). Front só tem `link` e `board`.

## Fazer

`gameFetch` + tipo do `VehicleSheetActionDto`. UI: plano 20.

## Pronto quando

A ação de ficha do veículo pode ser disparada pelo client.

## Feito

`postVehicleSheetAction` + `useVehicleSheetAction`. Tipos em `entities/actor/vehicle-sheet.ts` (`board` | `dismount` | `set-metrics` | `helm`). UI no plano 20.
