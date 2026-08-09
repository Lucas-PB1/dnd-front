# Exemplares (front) — quatro classes de referência

Base comum:

- Switch: `src/features/character/character-sheet/ui/beyond/combat/class-combat-panel.tsx`
- Economy Usar: `…/api/use-economy-table-action.ts`
- Resolve painel: `…/lib/combat/resolve-panel-actions.ts`
- Catálogo: `useCombatMechanicalCatalog`

## Feiticeiro — modelo caster

- Painel: `…/panels/sorcerer-panel.tsx`
- API client: `executeSorcererTableAction` em `character-session.api.ts`
- Economy Usar: `classSlug: sorcerer` + `table_action` do catálogo (Bastião usa `spendAmount` → `pointsSpent`)
- Painel: base + subclass do catálogo; Fonte de Magia e metamagia locais; Bastião 1–5 pts

## Bruxo

- Painel: `…/panels/warlock-panel.tsx`
- `executeWarlockTableAction` via `classSlug: warlock` na economy
- Extras UI: invocações (Conjurar free_cast no painel), pact blade

## Mago

- Painel: `…/panels/wizard-panel.tsx`
- `executeWizardTableAction` via `classSlug: wizard` (e protocolos `cast:` / `arm:`)
- Economy: `cast:misseis-magicos-free`, `arm:missile-shield`, `arm:giga-missile` + slugs de tradição

## Guerreiro

- Painel: `…/panels/fighter-panel.tsx` (+ `fighter-subclass-actions.tsx` para BM/Dungeon)
- `executeFighterTableAction` → `POST …/fighter/table-action` (`classSlug: fighter`)
- Catálogo painel: base + psi (`C010`); BM/Dungeon com seletor
- Economy Usar: slugs do catálogo + `psi:*` (payload `usePsiDie`)
- Lista BM: `GET …/fighter/maneuvers` (não é ação)

Classe nova: copiar **sorcerer/warlock/wizard/fighter** (table-action).
