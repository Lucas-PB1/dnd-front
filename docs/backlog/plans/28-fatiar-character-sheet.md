# Plano 28 — Fatiar `character-sheet`

**ID:** FR-9 · **Dificuldade:** difícil · **Status:** Feito · **Depende:** 27 (rede de segurança)

## Gap

God slice: `character-session.api.ts` enorme, UI beyond + edit + level-up + inventário juntos.

## Fazer

Ondas: fetch por dono (como a API); pastas por fluxo (combate, inventário, level-up, edição). Sem mover regra PHB para o front. `app/characters/[id]` continua fino.

## Pronto quando

Arquivos novos não passam de ~400 linhas sem motivo. Testes do 27 passam.

## Feito

Fetch de sessão: um POST genérico (`executeClassTableAction`) cujo `actionSlug` vem do catálogo; sem unions PHB no front. GETs de manobras isolados. UI já estava em combate / inventário / level-up / edição. Vitest combate 40/40.
