/**
 * Ações de mesa ligadas ao catálogo de economia (aba Ações → Usar).
 * IDs alinhados a class-action-economy.ts.
 */

export type EconomyTableAction =
  | "second-wind"
  | "action-surge"
  | "tactical-mind"
  | "psi:protective-field"
  | "psi:telekinetic-movement"
  | "psi:psychic-leap"
  | "psi:mental-guard"
  | "psi:energy-bulwark"
  | "psi:telekinetic-master";

export type PsiTableActionSlug =
  | "protective-field"
  | "telekinetic-movement"
  | "psychic-leap"
  | "mental-guard"
  | "energy-bulwark"
  | "telekinetic-master";

export function isPsiTableAction(
  action: EconomyTableAction,
): action is `psi:${PsiTableActionSlug}` {
  return action.startsWith("psi:");
}

export function psiSlugFromTableAction(
  action: `psi:${PsiTableActionSlug}`,
): PsiTableActionSlug {
  return action.slice(4) as PsiTableActionSlug;
}
