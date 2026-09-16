# Plano 17 — UI `strikeOptions`

**ID:** FR-35 · **Dificuldade:** média · **Status:** Feito · **Depende:** 05

## Gap

Catálogo mecânico traz golpes (caça / blood-hound etc.). Depois de tipar, nenhum painel consome.

## Fazer

Painel da subclasse dona (patrulheiro/blood-hound): listar opções da API, gastar via table-action já existente se houver `tableAction`. Sem lista local.

## Pronto quando

Jogador vê e usa golpes do catálogo, não de array TS.

## Feito

Painel do Guerreiro lista `strikeOptions` do catálogo (Cão de Sangue). **Usar** chama `POST .../fighter/table-action` com `optionSlug` quando o personagem conhece o golpe (`bloodStrikeN`). Sem lista hardcoded.
