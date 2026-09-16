# Plano 04 — Tipos de `CharacterState`

**ID:** FR-12 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`CharacterStateResponseDto` manda wild shape (`wildShapeActive`, template, known slugs, swap, `wildShapeActorId`) e `companions`. `session-types.ts` não declara.

## Fazer

Espelhar o DTO Nest + `CompanionTrackerDto`. Só tipos neste plano (UI: 18 e 19).

## Pronto quando

TypeScript descreve o GET `/characters/:id/state`.

## Feito

`CharacterState` inclui wild shape e `companions`. `CompanionTracker` em `entities/companion/types.ts` (mesmo DTO do GET companions). Sem UI.
