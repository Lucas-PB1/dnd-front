# Plano 11 — HTTP montarias

**ID:** FR-17 · **Dificuldade:** fácil · **Status:** Feito

## Gap

`POST /characters/:id/mounts/link|board|sheet-actions` existe. Front só fala `/vehicles/*`.

## Fazer

Três funções (espelhar vehicles). UI: plano 21.

## Pronto quando

Kind `mount` tem o mesmo client que veículo já tem para link/board, mais sheet-actions.

## Feito

`linkCharacterMount`, `boardCharacterMount`, `postMountSheetAction` e hooks `useLinkMount` / `useBoardMount` / `useMountSheetAction`. Ações: `board`, `dismount`, `healing-touch`, `fey-step`, `frighten`. UI no plano 21.
