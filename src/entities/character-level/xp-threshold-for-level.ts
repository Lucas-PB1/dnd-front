import type { CharacterLevel } from "@/entities/character-level/types";

export function xpThresholdForLevel(
  level: number,
  catalog: readonly Pick<CharacterLevel, "level" | "xpThreshold">[],
): number | null {
  const row = catalog.find((entry) => entry.level === level);
  return row?.xpThreshold ?? null;
}

export function formatXpThreshold(xp: number): string {
  return `${xp.toLocaleString("pt-BR")} XP`;
}
