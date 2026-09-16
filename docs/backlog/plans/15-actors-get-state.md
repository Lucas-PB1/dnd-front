# Plano 15 — `GET /actors/:id/state`

**ID:** FR-40 · **Dificuldade:** fácil · **Status:** Ready

## Gap

State ao vivo do actor. Front só faz `PATCH /actors/:id/state`.

## Fazer

`fetchActorState` + query. A página de actor pode hoje depender só do bundle GET actor; alinhar para o state endpoint como na ficha do PC.

## Pronto quando

A UI de actor lê state pelo GET dedicado (ou documenta por que o bundle basta e o tipo PATCH não substitui leitura).
