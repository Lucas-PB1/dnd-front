# Plano 14 — `DELETE /actors/:id`

**ID:** FR-39 · **Dificuldade:** fácil · **Status:** Feito

## Gap

A API apaga actor. O front não chama.

## Fazer

Client + botão na ficha de actor (confirmação). Invalidar `GET /actors` e `GET /characters/:id/actors`.

## Pronto quando

Dá para remover um actor pela UI da página `/actors/[id]`.

## Feito

`deleteActor` + `useDeleteActor` + `DeleteActorButton` na página da ficha. Confirmação em dois cliques. Após sucesso, volta ao personagem vinculado ou a `/characters`.
