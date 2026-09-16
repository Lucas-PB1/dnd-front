# Plano 32 — Unlock de subclasse no create

**ID:** FR-6 · **Dificuldade:** difícil · **Status:** Feito

## Gap

Level-up usa `subclassUnlockLevel` da preview. Create usa `SUBCLASS_UNLOCK_LEVEL_DEFAULT = 3`.

## Fazer

Ler unlock de `GET /classes/:slug` (se já existir no DTO) ou progression. Wizard não assume 3.

## Pronto quando

Classe com unlock ≠ 3 funciona no create sem constante.

## Feito

`GET /classes/:slug` envia `subclassUnlockLevel`. Schema, identidade e payload usam esse valor; sem default 3 no front.
