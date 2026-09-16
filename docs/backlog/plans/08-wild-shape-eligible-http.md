# Plano 08 — HTTP Forma Selvagem eligible

**ID:** FR-15 · **Dificuldade:** fácil · **Status:** Ready · **Depende:** 04 (tipos de state, se a resposta reusar slugs)

## Gap

`GET /characters/:id/druid/wild-shape/eligible` existe. Nenhum `gameFetch`.

## Fazer

Função + query key + hook. Sem UI (plano 18). Tipar o DTO `WildShapeEligibleListResponseDto`.

## Pronto quando

O front consegue listar bestas elegíveis autenticado.
