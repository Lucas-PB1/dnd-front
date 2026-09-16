# Plano 07 — Flags de feat na UI

**ID:** FR-31 · **Dificuldade:** fácil · **Status:** Feito

## Gap

A ficha já traz `featEffectFlags`. Inspiração/dado/flex **já** ligam. Mortos: `improveCritical`, `wieldTwoHandedOneHand`, `versatileOneHandFullDamage`.

## Fazer

No card de ataque (e dano se couber): crít. melhorado, empunhadura duas mãos, versátil 1 mão = dado cheio. Não recalcular no front — só refletir o flag da API.

## Pronto quando

Personagem com esses talentos vê o efeito na UI de ataque.

## Feito

Chips no card de ataque (`AttackBadges`) quando os três flags vêm `true`. Sem payload extra nem cálculo de dado/crítico no front.
