# Plano 04 — Tipos de `CharacterState`

**ID:** FR-12 · **Dificuldade:** fácil · **Status:** Ready

## Gap

`CharacterStateResponseDto` manda wild shape (`wildShapeActive`, template, known slugs, swap, `wildShapeActorId`) e `companions`. `session-types.ts` não declara.

## Fazer

Espelhar o DTO Nest + `CompanionTrackerDto`. Só tipos neste plano (UI: 18 e 19).

## Pronto quando

TypeScript descreve o GET `/characters/:id/state`.
