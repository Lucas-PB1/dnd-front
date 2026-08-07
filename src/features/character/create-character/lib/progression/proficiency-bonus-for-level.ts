import type { CharacterLevel } from "@/entities/character-level/types";

/** PB a partir do catálogo `GET /character-levels` (sem tabela local). */
export function proficiencyBonusForLevel(
  level: number,
  catalog: readonly Pick<CharacterLevel, "level" | "proficiencyBonus">[],
): number {
  const row = catalog.find((entry) => entry.level === level);
  if (!row) {
    throw new Error(`Proficiency bonus not found for level ${level}`);
  }
  return row.proficiencyBonus;
}
