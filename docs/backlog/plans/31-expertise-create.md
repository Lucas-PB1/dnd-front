# Plano 31 — Expertise no create + Jack of All Trades

**ID:** FR-5 · **Dificuldade:** difícil · **Status:** Feito

## Gap

Level-up já usa `newClassExpertiseSlots`. Create e `hasJackOfAllTrades` ainda leem `class-expertise-slots.ts` (cópia da API).

## Fazer

Slots no create via API (options/progression). JoaT: flag na ficha/state, não `classSlug === "bard" && level >= 2`.

## Pronto quando

Arquivo `class-expertise-slots.ts` some ou vira só tipo.

## Feito

Create e level-up leem grupos `expertiseSkill*` de `GET /classes/:slug/options`. A ficha aplica Jack of All Trades com `character.jackOfAllTrades`.
