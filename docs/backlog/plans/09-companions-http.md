# Plano 09 — HTTP companions GET/dismiss

**ID:** FR-16 · **Dificuldade:** fácil · **Status:** Feito

## Gap

Existem `GET /characters/:id/companions` e `POST .../dismiss`. Só `POST .../sync` está no front.

## Fazer

Clientes + hooks em `features/companion/api`. Sem painel (plano 19).

## Pronto quando

Dá para listar e dispensar sem passar pela UI nova.

## Feito

`fetchCharacterCompanions` + `dismissCharacterCompanion`, `companionKeys`, `useCharacterCompanions` e `useDismissCharacterCompanion`. Tipo `CompanionTracker` (plano 04). UI no plano 19.
