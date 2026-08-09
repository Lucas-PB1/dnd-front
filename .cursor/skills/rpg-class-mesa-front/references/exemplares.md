# Exemplares (front) — quatro classes de referência

Base comum:

- Switch: `src/features/character/character-sheet/ui/beyond/combat/class-combat-panel.tsx`
- Economy Usar: `…/api/use-economy-table-action.ts`
- Resolve painel: `…/lib/combat/resolve-panel-actions.ts`
- Catálogo: `useCombatMechanicalCatalog`

## Feiticeiro — modelo caster

- Painel: `…/panels/sorcerer-panel.tsx`
- API client: `executeSorcererTableAction` em `character-session.api.ts`
- Economy set: slugs `tides-of-chaos`, `bastion-of-law`, `innate-sorcery`, …
- Painel: base + subclass do catálogo; Fonte de Magia e metamagia locais; Bastião 1–5 pts

## Bruxo

- Painel: `…/panels/warlock-panel.tsx`
- `executeWarlockTableAction` + set de economy warlock
- Extras UI: invocações, pact blade (além do catálogo panel)

## Mago

- Painel: `…/panels/wizard-panel.tsx`
- `executeWizardTableAction`
- Economy especiais: `cast:misseis-magicos-free`, `arm:missile-shield`, `arm:giga-missile`

## Guerreiro

- Painel: `…/panels/fighter-panel.tsx` (+ `fighter-subclass-actions.tsx` para BM/Dungeon)
- `executeFighterTableAction` → `POST …/fighter/table-action`
- Catálogo painel: base + psi (`C010`/`C019`); BM/Dungeon com seletor
- Economy Usar: `second-wind` / `action-surge` / `tactical-mind` / `psi:*`
- Lista BM: `GET …/fighter/maneuvers` (não é ação)

Classe nova: copiar **sorcerer/warlock/wizard/fighter** (table-action).
