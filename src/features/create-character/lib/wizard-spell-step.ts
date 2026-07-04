/** Espelha maxSpellLevelForCharacterLevel em dnd-api level-up.service.ts */
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
};

export function computeWizardHasSpellStep(
  input: WizardSpellStepInput,
): boolean {
  return (
    input.classSpellSlotCount > 0 ||
    input.classSpellCount > 0 ||
    input.subclassSpellCount > 0
  );
}
