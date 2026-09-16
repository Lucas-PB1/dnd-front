# Plano 02 — `minTraitTakes`

**ID:** FR-33 · **Dificuldade:** fácil · **Status:** Ready

## Gap

Front `ClassEconomyActionRecord.minTraitTakes` existe. DTO Nest `ClassEconomyActionDto` **não** lista o campo.

## Fazer

Ver o mapper do `GET /combat-mechanical-catalog`. Se o JSON não traz: **remover** do tipo front. Se traz e o Swagger omite: tipar igual ao JSON (e opcionalmente abrir PR na API no Swagger).

Não inventar filtro de traço no front sem o campo.

## Pronto quando

Tipo = resposta real. Sem campo fantasma.
