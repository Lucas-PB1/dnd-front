/** Espelha ASI_FEAT_LEVELS em dnd-api level-up.service.ts */
export const ASI_FEAT_LEVELS = [4, 8, 12, 16, 19] as const;

export function countAsiFeatSlots(level: number): number {
  return ASI_FEAT_LEVELS.filter((asiLevel) => asiLevel <= level).length;
}

export function asiFeatLevelsUpTo(level: number): number[] {
  return ASI_FEAT_LEVELS.filter((asiLevel) => asiLevel <= level);
}
