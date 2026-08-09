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

Classe nova: copiar uma destas (table-action + Economia com `resource_slug` / ±).

## Feiticeiro — **concluída**

- Painel: `…/panels/sorcerer-panel.tsx`
- API client: `executeSorcererTableAction` em `character-session.api.ts`
- Economy Usar: `classSlug: sorcerer` + `table_action` do catálogo (Bastião usa `spendAmount` → `pointsSpent`)
- Painel: base + subclass do catálogo; Fonte de Magia e metamagia locais; Bastião 1–5 pts

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
- `executeFighterTableAction` → `POST …/fighter/table-action` (`classSlug: fighter`)
- Catálogo painel: base + psi (`C010`); BM/Dungeon com seletor
- Economy Usar: slugs do catálogo + `psi:*` (payload `usePsiDie`)
- Lista BM: `GET …/fighter/maneuvers` (não é ação)

## Patrulheiro — **concluída**

- Painel: `…/panels/ranger-panel.tsx` — só Poderes (subclasse + Aspecto); **sem** summary de pools base
- `executeRangerTableAction` via `classSlug: ranger`
- Economy (controle de recurso): linhas C009 com `resource_slug` → ± na lista; `table_action` → Usar
- `plan-economy-table-use`: `counterSlug` mesmo sem `tableAction` se houver `resourceSlug`
- Polish adiado: tracker Companheiro Primal
