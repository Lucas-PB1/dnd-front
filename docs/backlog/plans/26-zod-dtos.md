# Plano 26 — Zod nos DTOs críticos

**ID:** FR-8 · **Dificuldade:** média · **Status:** Ready · **Depende:** 04, 05 (tipos estáveis)

## Gap

`gameFetch<T>` só compile-time. Drift de campo some em runtime.

## Fazer

Parse Zod no client do slice: `CharacterState`, inventory, combat-mechanical. Erro visível na UI. Sem fatiar o slice (plano 28).

## Pronto quando

Resposta inválida não vira `undefined` silencioso nos hotspots.
