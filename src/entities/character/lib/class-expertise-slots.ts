export type ClassExpertiseSlot = {
  optionKey: string;
  unlockLevel: number;
};

export function isClassExpertiseOptionKey(optionKey: string): boolean {
  return /^expertiseSkill\d+$/.test(optionKey);
}

export function classExpertiseSlotsAtLevel(
  slots: readonly ClassExpertiseSlot[],
  level: number,
): ClassExpertiseSlot[] {
  return slots.filter((slot) => slot.unlockLevel <= level);
}

export function classExpertiseSlotsNewAtLevel(
  slots: readonly ClassExpertiseSlot[],
  level: number,
): ClassExpertiseSlot[] {
  return slots.filter((slot) => slot.unlockLevel === level);
}

export function hasJackOfAllTrades(
  unlockLevel: number | null | undefined,
  level: number,
): boolean {
  return unlockLevel != null && level >= unlockLevel;
}

export function expertiseSlotsFromClassOptions(
  groups: readonly { optionKey: string; unlockLevel: number }[],
): ClassExpertiseSlot[] {
  return groups
    .filter((group) => isClassExpertiseOptionKey(group.optionKey))
    .map((group) => ({
      optionKey: group.optionKey,
      unlockLevel: group.unlockLevel,
    }));
}

export function expertiseWhitelistFromClassOptions(
  groups: readonly {
    optionKey: string;
    values: readonly { valueId: string }[];
  }[],
): string[] | null {
  const expertise = groups.filter((group) =>
    isClassExpertiseOptionKey(group.optionKey),
  );
  const slugs = [
    ...new Set(
      expertise.flatMap((group) => group.values.map((value) => value.valueId)),
    ),
  ];
  if (slugs.length === 0) return null;
  return slugs;
}
