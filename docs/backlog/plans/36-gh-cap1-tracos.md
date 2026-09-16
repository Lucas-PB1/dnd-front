# Plano 36 — GH Cap. 1 sub-escolhas

**ID:** FR-26 · **Dificuldade:** média · **Status:** Feito

Wizard de criação; várias chaves (`choice_kind`).

## Gap

Traços GH com sub-escolhas (dano / arma / skill / truque) sem UI completa no create.

## Fazer

Campos no step de espécie/heritage conforme options da API. Sem hardcode de slug de traço.

## Pronto quando

Create persiste as chaves que a API já valida.

## Feito

`phb_option_def` scope `heritage`; `GET /heritages/:slug/traits` manda `options`. Wizard pede `heritage_opt_{slot}_{optionKey}` e a ficha persiste em `player_character_species_choice`.
