# Plano 40 — Combate real

**ID:** FR-29 · **Dificuldade:** mais difícil · **Status:** Feito

Pedido explícito. Lista completa permanece em [`combat-real-deferred.md`](../../../../dnd-api/docs/plans/combat-real-deferred.md) (saves, board, manobras no acerto, etc.).

## Gap

Encontro só tinha iniciativa e HP manual; duelo 1v1 já resolvia arma vs CA.

## Fazer

Resolver ataque no encontro: rolagem vs CA do alvo e aplicar dano nos PV.

## Pronto quando

Mestre ou jogador (com o próprio PC) ataca outro combatente e o HP do alvo muda.

## Feito

`POST /campaigns/:campaignId/encounters/:encounterId/attacks` — PC usa `CharacterRollsService`; actor usa ação com `attackBonus`. Acerto vs CA (nat. 1 erra, 20 é crítico). Dano aplica PV temp. e atuais. Front: painel **Atacar** na tela do encontro.
