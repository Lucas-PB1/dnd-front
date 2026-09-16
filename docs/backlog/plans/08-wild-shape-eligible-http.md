# Plano 08 — HTTP Forma Selvagem eligible

**ID:** FR-15 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`GET /characters/:id/druid/wild-shape/eligible` existe. Nenhum `gameFetch`.

## Fazer

Função + query key + hook. Sem UI (plano 18). Tipar o DTO `WildShapeEligibleListResponseDto`.

## Pronto quando

O front consegue listar bestas elegíveis autenticado.

## Feito

`fetchWildShapeEligible` + `wildShapeKeys` + `useWildShapeEligible`. Tipos em `entities/character/wild-shape-eligible.ts`. UI no plano 18.
