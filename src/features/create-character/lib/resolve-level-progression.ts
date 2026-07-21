import type { ClassProgressionRow } from "@/entities/class/types";
import type { ClassSpellSlots } from "@/entities/class/types";

/** Cotas do nível: progressão dedicada ou campos em spell-slots (fallback). */
export function resolveLevelProgression(
  level: number,
  progressionRow: ClassProgressionRow | undefined,
  slotRow: ClassSpellSlots | undefined,
): ClassProgressionRow | undefined {
  if (progressionRow) return progressionRow;
  if (!slotRow || slotRow.classLevel !== level) return undefined;
  if (
    slotRow.cantrips == null &&
    slotRow.preparedSpells == null &&
    slotRow.channelDivinity == null
  ) {
    return undefined;
  }
  return {
    level: slotRow.classLevel,
    proficiencyBonus: slotRow.proficiencyBonus ?? 2,
    cantrips: slotRow.cantrips ?? null,
    preparedSpells: slotRow.preparedSpells ?? null,
    channelDivinity: slotRow.channelDivinity ?? null,
  };
}
