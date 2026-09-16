# Plano 16 — Roll de ataque do actor

**ID:** FR-41 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`POST /actors/:id/rolls/attack` existe. Personagem tem `character-rolls.api`; actor não.

## Fazer

Client + botão nas actions do actor (página `/actors/[id]`). Não é combate real de encontro.

## Pronto quando

Uma action de actor dispara o roll e mostra o total.

## Feito

`rollActorAttack` + `useRollActorAttack`. Chip **Ataque** da ficha chama a API (vantagem da toolbar). O total aparece na ficha. Dano local no chip continua no front.
