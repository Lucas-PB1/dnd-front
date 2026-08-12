/**
 * Espelha dnd-api `fighting-style-unlock.ts`.
 */

const FIGHTING_STYLE_UNLOCK_LEVEL: Readonly<Record<string, number>> = {
  fighter: 1,
  paladin: 2,
  ranger: 2,
};

export function fightingStyleUnlockLevel(
  classSlug: string | null | undefined,
): number | null {
  return FIGHTING_STYLE_UNLOCK_LEVEL[classSlug ?? ""] ?? null;
}

export function classHasFightingStylePick(
  classSlug: string | null | undefined,
  level: number,
): boolean {
  const unlock = fightingStyleUnlockLevel(classSlug);
  return unlock != null && level >= unlock;
}
