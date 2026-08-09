/**
 * Ações de mesa ligadas ao catálogo de economia (aba Ações → Usar).
 * IDs vêm de `economyActions[].tableAction` na API.
 *
 * Protocolos (prefixo / literal) — não dependem de classSlug:
 * - `spend-resource` — gasta resourceSlug
 * - `cast:…` — conjuração especial (ex.: mísseis gratuitos)
 * - `arm:…` — armar/desarmar flag de sessão (Mago MM)
 * - `psi:…` — ação psi (hoje Guerreiro; usePsiDie no payload)
 *
 * Demais slugs: roteiam por `economyActions[].classSlug` → POST …/<class>/table-action.
 */

/** Identificador de ação de mesa (string livre do catálogo). */
export type EconomyTableAction = string;

export type PsiTableActionSlug = string;

export const SPEND_RESOURCE_TABLE_ACTION = "spend-resource";

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

export function isArmTableAction(
  action: string,
): action is `arm:${string}` {
  return action.startsWith("arm:");
}

export function isCastTableAction(
  action: string,
): action is `cast:${string}` {
  return action.startsWith("cast:");
}

/** `arm:missile-shield` + armed → `disarm-missile-shield` / `arm-missile-shield`. */
export function wizardSlugFromArmTableAction(
  action: `arm:${string}`,
  armed: boolean,
): string {
  return action.replace(/^arm:/, armed ? "disarm-" : "arm-");
}
