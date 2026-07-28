/**
 * Espelha dnd-api `game/progression/domain/asi-feat-levels.ts`.
 * Níveis em que a maioria das classes ganha ASI / talento (PHB 2024).
 */
export const BASE_ASI_FEAT_LEVELS = [4, 8, 12, 16, 19] as const;

/** ASI extras: Guerreiro 6/14, Ladino 10. */
export const EXTRA_ASI_FEAT_LEVELS_BY_CLASS: Readonly<
  Record<string, readonly number[]>
> = {
  fighter: [6, 14],
  rogue: [10],
};

/** @deprecated Prefer BASE_ASI_FEAT_LEVELS / asiFeatLevelsForClass. */
export const ASI_FEAT_LEVELS = BASE_ASI_FEAT_LEVELS;

export function asiFeatLevelsForClass(
  classSlug: string | null | undefined,
): number[] {
  const extras = EXTRA_ASI_FEAT_LEVELS_BY_CLASS[classSlug ?? ""] ?? [];
  return [...BASE_ASI_FEAT_LEVELS, ...extras].sort((a, b) => a - b);
}

export function countAsiFeatSlots(
  classSlug: string | null | undefined,
  level: number,
): number {
  return asiFeatLevelsForClass(classSlug).filter((asiLevel) => asiLevel <= level)
    .length;
}

export function asiFeatLevelsUpTo(
  classSlug: string | null | undefined,
  level: number,
): number[] {
  return asiFeatLevelsForClass(classSlug).filter((asiLevel) => asiLevel <= level);
}
