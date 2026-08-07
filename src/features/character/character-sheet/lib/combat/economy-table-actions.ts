/**
 * Ações de mesa ligadas ao catálogo de economia (aba Ações → Usar).
 * IDs vêm de `economyActions[].tableAction` na API.
 */

/** Identificador de ação de mesa (string livre do catálogo). */
export type EconomyTableAction = string;

export type PsiTableActionSlug = string;

export function isPsiTableAction(
  action: string,
): action is `psi:${PsiTableActionSlug}` {
  return action.startsWith("psi:");
}

export function psiSlugFromTableAction(
  action: `psi:${PsiTableActionSlug}`,
): PsiTableActionSlug {
  return action.slice(4);
}
