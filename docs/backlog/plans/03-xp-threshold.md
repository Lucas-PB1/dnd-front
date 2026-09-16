# Plano 03 — `xpThreshold`

**ID:** FR-32 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`GET /character-levels` devolve `xpThreshold`. O tipo front tem o campo; **nenhuma UI** lê.

## Fazer

Ou mostrar XP do nível na ficha/wizard (dado do catálogo), ou tirar do tipo para não fingir contrato.

Não calcular XP no front.

## Pronto quando

Campo usado **ou** removido do tipo.

## Feito

O limiar vem só de `GET /character-levels` (`xpThresholdForLevel`). Ficha (chip Nv.), wizard (identidade) e preview de level-up mostram o valor; sem tabela local de XP.
