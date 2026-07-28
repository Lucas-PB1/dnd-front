/**
 * Highest spell circle with at least one slot.
 * Mirrors dnd-api `maxSpellLevelFromSlots` (class slot tables = SSOT).
 */
export function maxSpellLevelFromSlots(
  slots: Record<string, number> | null | undefined,
): number {
  if (!slots) return 0;
  let max = 0;
  for (const [circle, count] of Object.entries(slots)) {
    if (count <= 0) continue;
    const level = Number(circle);
    if (Number.isFinite(level) && level > max) max = level;
  }
  return max;
}

/**
 * @deprecated Prefer maxSpellLevelFromSlots from the class slot row.
 * Kept for tests / fallback — full-caster table only.
 */
export function wizardMaxSpellLevelForLevel(level: number): number {
  if (level >= 17) return 9;
  if (level >= 15) return 8;
  if (level >= 13) return 7;
  if (level >= 11) return 6;
  if (level >= 9) return 5;
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  if (level >= 1) return 1;
  return 0;
}

export type WizardSpellStepInput = {
  classSpellSlotCount: number;
  classSpellCount: number;
  subclassSpellCount: number;
  subclassSpellSlotCount?: number;
};

export function computeWizardHasSpellStep(
  input: WizardSpellStepInput,
): boolean {
  return (
    input.classSpellSlotCount > 0 ||
    input.classSpellCount > 0 ||
    input.subclassSpellCount > 0 ||
    (input.subclassSpellSlotCount ?? 0) > 0
  );
}
