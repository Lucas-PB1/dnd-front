export const FIGHTING_STYLE_FEAT_CATEGORY = "fighting-style";

export function isFightingStyleSubclassOptionKey(optionKey: string): boolean {
  return (
    optionKey === "additionalFightingStyle" ||
    optionKey === "fighting_style" ||
    optionKey.endsWith("FightingStyle")
  );
}

export function collectTakenFightingStyleSlugs(input: {
  characterFeatSlugs: string[];
  fightingStyleFeatSlugs: Set<string>;
  subclassOptions: { optionKey: string; valueId: string }[];
}): string[] {
  const fromFeats = input.characterFeatSlugs.filter((slug) =>
    input.fightingStyleFeatSlugs.has(slug),
  );
  const fromSubclass = input.subclassOptions
    .filter((option) => isFightingStyleSubclassOptionKey(option.optionKey))
    .map((option) => option.valueId);
  return [...fromFeats, ...fromSubclass];
}

export function filterAllowedFightingStyleValues<
  T extends { valueId: string },
>(values: T[], classFightingStyleSlugs: string[], takenStyleSlugs: string[]): T[] {
  const allowed = new Set(classFightingStyleSlugs);
  const taken = new Set(takenStyleSlugs);
  return values.filter(
    (item) => allowed.has(item.valueId) && !taken.has(item.valueId),
  );
}
