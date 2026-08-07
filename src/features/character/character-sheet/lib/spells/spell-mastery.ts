/** Espelha chaves de Dominância de Magias (classOptions na API). */
export const SPELL_MASTERY_LEVEL_1_KEY = "spellMastery1";
export const SPELL_MASTERY_LEVEL_2_KEY = "spellMastery2";
export const SPELL_MASTERY_UNLOCK_LEVEL = 18;

export function isSpellMasteryOptionKey(optionKey: string): boolean {
  return (
    optionKey === SPELL_MASTERY_LEVEL_1_KEY ||
    optionKey === SPELL_MASTERY_LEVEL_2_KEY
  );
}

export function readSpellMasterySlugs(
  classOptions: readonly { optionKey: string; valueId: string }[] | null | undefined,
): { level1: string | null; level2: string | null } {
  let level1: string | null = null;
  let level2: string | null = null;
  for (const option of classOptions ?? []) {
    if (option.optionKey === SPELL_MASTERY_LEVEL_1_KEY) level1 = option.valueId;
    if (option.optionKey === SPELL_MASTERY_LEVEL_2_KEY) level2 = option.valueId;
  }
  return { level1, level2 };
}

export function mergeSpellMasteryIntoClassOptions(
  classOptions: readonly { optionKey: string; valueId: string }[],
  picks: { level1: string | null; level2: string | null },
): { optionKey: string; valueId: string }[] {
  const kept = classOptions.filter(
    (option) => !isSpellMasteryOptionKey(option.optionKey),
  );
  if (picks.level1) {
    kept.push({ optionKey: SPELL_MASTERY_LEVEL_1_KEY, valueId: picks.level1 });
  }
  if (picks.level2) {
    kept.push({ optionKey: SPELL_MASTERY_LEVEL_2_KEY, valueId: picks.level2 });
  }
  return kept;
}
