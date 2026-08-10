# Exemplares (front) — classes concluídas (critério mesa)

Base comum:

- Switch: `src/features/character/character-sheet/ui/beyond/combat/class-combat-panel.tsx`
- Economy Usar: `…/api/use-economy-table-action.ts`
- Resolve painel: `…/lib/combat/resolve-panel-actions.ts`
- Catálogo: `useCombatMechanicalCatalog`

**Concluídas** (alinhar com skill API `references/exemplares.md`):

| Classe | Status mesa |
|--------|-------------|
| Feiticeiro | **Concluída** |
| Bruxo | **Concluída** |
| Mago | **Concluída** |
| Guerreiro | **Concluída** |
| Patrulheiro | **Concluída** |
| Ladino | **Concluída** |
| Paladino | **Concluída** |
| Pistoleiro | **Concluída** |

Classe nova: copiar uma destas (table-action + Economia com `resource_slug` / ±).

## Feiticeiro — **concluída**

- Painel: `…/panels/sorcerer-panel.tsx`
- API client: `executeSorcererTableAction` em `character-session.api.ts`
- Economy Usar: `classSlug: sorcerer` + `table_action` do catálogo (Bastião usa `spendAmount` → `pointsSpent`)
- Painel: base + subclass do catálogo; Fonte de Magia e metamagia locais; Bastião 1–5 pts
- **Sem** `CombatResourceSummary` (pools ± só na Economia — anti-padrão espelho no Ferramentas)

## Bruxo — **concluída**

- Painel: `…/panels/warlock-panel.tsx`
- `executeWarlockTableAction` via `classSlug: warlock` na economy
- Extras UI: invocações (Conjurar free_cast no painel), pact blade

## Mago — **concluída**

- Painel: `…/panels/wizard-panel.tsx`
- `executeWizardTableAction` via `classSlug: wizard` (e protocolos `cast:` / `arm:`)
- Economy: `cast:misseis-magicos-free`, `arm:missile-shield`, `arm:giga-missile` + slugs de tradição
- Polish adiado: modal Escudo/Giga no cast

## Guerreiro — **concluída**

- Painel: `…/panels/fighter-panel.tsx` (+ `fighter-subclass-actions.tsx` para BM/Dungeon)
- **Sem** `CombatResourceSummary` (pools ± só na Economia)
- `executeFighterTableAction` → `POST …/fighter/table-action` (`classSlug: fighter`)
- Catálogo painel: base + psi (`C010`); BM/Dungeon com seletor
- Economy: C009 base/psi/BM + pool `dungeon-precautions` (±); `psi:*` no Usar com `usePsiDie`
- Lista BM: `GET …/fighter/maneuvers` (não é ação)

## Patrulheiro — **concluída**

- Painel: `…/panels/ranger-panel.tsx` — só Poderes (subclasse + Aspecto); **sem** summary de pools base
- `executeRangerTableAction` via `classSlug: ranger`
- Economy (controle de recurso): linhas C009 com `resource_slug` → ± na lista; `table_action` → Usar
- `plan-economy-table-use`: `counterSlug` mesmo sem `tableAction` se houver `resourceSlug`
- Polish adiado: tracker Companheiro Primal

## Ladino — **concluída**

- Painel: `…/panels/rogue-panel.tsx` — Poderes via `resolvePanelActions` (C010); extras locais (Furtivo Nd6, Total/CD, toggle dado psi, Golpe de Sorte na iniciativa)
- `executeRogueTableAction` via `classSlug: rogue`
- Economy: C009 com `resource_slug` (±) + `table_action` (Usar) para Soulknife / AT / Arachnoid; `strokeOfLuck` só contador
- **Lâminas Psíquicas:** cards de ataque virtuais na ficha (`psychic-blade`) — Furtivo/Golpe Astuto no `rogue-attack-options` (não no painel)
- Ataque: `rogue-attack-options.tsx` (Furtivo / Golpe Astuto / Assassino)
- Polish adiado: Teia/posição, condições persistentes — ver exemplares API

## Paladino — **concluída**

- Painel: `…/panels/paladin-panel.tsx` — Mãos Consagradas (amount + Curar / Curar Veneno); canais via `resolvePanelActions` (C010)
- `executePaladinTableAction` via `classSlug: paladin` na economy (`oath-channel`, `peerless-athlete`, …)
- Economy: base (`layOnHands` / `channelDivinity`) + **linhas por juramento** (canais nomeados, auras L7, pools L15/L20 incl. Folia)
- **Sem** espelho de Canalizar `remaining/max` no Ferramentas (só ± na Economia)
- Ataque: Destruição Divina / Golpes Radiantes nos cards
- Polish adiado: Defesa Gloriosa / Destruição Protetora Usar dedicado

## Pistoleiro — **concluída**

- Painel: `…/panels/maneuvers-panel.tsx` — manobras via `executeGunslingerTableAction` (`use-maneuver`); Gambito Terrível (C010 `recover-risk`)
- `executeGunslingerTableAction` via `classSlug: gunslinger` na economy
- Economy: `risk` (±); Tempo Bala / Tiro na Cabeça + lembretes por sub Valdas (saída, pinball, Tiro Focado, …)
- **Sem** espelho de risk `remaining/max` no Ferramentas (só ± na Economia)
- Manobras: C001 base + todas as 7 subs (painel via `GET …/maneuvers`)
- Polish adiado: Assumidor de risco; condições White Hat; Bang cast; polish câmaras
