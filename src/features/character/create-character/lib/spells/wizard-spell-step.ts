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
