# Plano 35 — Modal boosts de Mísseis Mágicos

**ID:** FR-23 · **Dificuldade:** média · **Status:** Feito

Detalhe: [`mm-cast-options-modal.md`](../../../../dnd-api/docs/plans/mm-cast-options-modal.md).

## Gap

Escudo/Giga armam na Economia. Cast não pergunta no mesmo POST.

## Fazer

API: flags no cast. Front: modal na conjuração de `misseis-magicos` (subclasse magic-missile-mage).

## Pronto quando

Boost no mesmo fluxo de conjurar, sem obrigar armar antes.

## Feito

`CastSpellDto.applyMissileShield` / `applyGigaMissile` (ou `state` armado). Modal em Magias e no uso gratuito da Economia; armar antigo permanece.
