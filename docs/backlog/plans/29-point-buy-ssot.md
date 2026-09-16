# Plano 29 — Point-buy SSOT

**ID:** FR-3 · **Dificuldade:** difícil · **Status:** Blocked

## Gap

Custos 8–15 e budget 27 em `point-buy.ts`. API valida em `ability-generation.ts`. `GET /ability-generation-methods` só traz slug/name/description — **não** a tabela de custo.

## Fazer

API expor custos/budget (ou o front só envia scores e mostra erro da API). UI pode continuar com stepper, sem ser SSOT.

## Pronto quando

Números oficiais não duplicam o TS da API.
