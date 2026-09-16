# Plano 29 — Point-buy SSOT

**ID:** FR-3 · **Dificuldade:** difícil · **Status:** Feito · **Depende:** contrato `GET /ability-generation-methods`

## Gap

Custos 8–15 e budget 27 em `point-buy.ts`. API valida em `ability-generation.ts`. `GET /ability-generation-methods` só trazia slug/name/description.

## Fazer

API expor custos/budget (ou o front só envia scores e mostra erro da API). UI pode continuar com stepper, sem ser SSOT.

## Pronto quando

Números oficiais não duplicam o TS da API.

## Feito

`GET /ability-generation-methods` inclui `pointBuy` (budget, min/max, `costByScore`), `pool` no conjunto padrão e totais da rolagem, lidos de `ability-generation.ts`. O wizard calcula gasto e opções com essas regras; Zod só exige scores preenchidos.
