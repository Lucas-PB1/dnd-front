# Plano 25 — Pools de ferramentas no wizard

**ID:** FR-2 · **Dificuldade:** média · **Status:** Feito

## Gap

`INSTRUMENT_OPTIONS` / `GAMING_SET_OPTIONS` / `ARTISAN_TOOL_OPTIONS` em `equipment-choice-resolve.ts`. Itens `tool` estão no DB; `GET /items` não filtra `toolCategory`.

## Fazer

API: listar tools por categoria/kind. Front: `toolOptionsForPool` busca o catálogo. Sem array PHB no TS.

## Pronto quando

Picker de instrumento/jogo/artesão só mostra items da API.
