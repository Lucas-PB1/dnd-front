# Plano 06 — PATCH condições em delta

**ID:** FR-30 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`PatchCharacterStateDto` aceita `addConditions` e `removeConditions`. O front só manda `conditions` (lista inteira).

## Fazer

Estender `PatchCharacterStatePayload`. A UI de condições (combate/status) passa a delta quando fizer sentido; não reenviar o array completo se a API já faz merge.

## Pronto quando

Um fluxo da ficha usa add/remove; tipos alinhados ao Nest.

## Feito

Payload com `addConditions` / `removeConditions`. Editor da faixa de combate envia só o delta; `conditions` inteiro permanece no tipo se alguém precisar substituir a lista.
