# Plano 39 — Companheiro Primal

**ID:** FR-27 · **Dificuldade:** difícil · **Status:** Feito

Só com pedido explícito. **Não** é o tracker genérico (plano 19). Detalhe: [`beast-master-primal-companion.md`](../../../../dnd-api/docs/plans/beast-master-primal-companion.md).

## Gap

Opção `primalCompanion` na ficha; economia só gera nota. Sem PV/comandos persistidos.

## Fazer

Estado + painel patrulheiro (invocar, PV, Golpe da Fera) conforme o plano da API.

## Pronto quando

Senhor das Feras opera a fera na mesa sem VTT.

## Feito

Painel do Patrulheiro (e Espírito Primal) usa `primal-companion-summon` / `restore` / comandos tipados; PV vem de `state.companions`. Card de ataque: toggle **Golpe da Fera** dispara o comando `strike` ao Atacar. Sem encontro/VTT.
