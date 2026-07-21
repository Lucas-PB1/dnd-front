export const RESILIENT_FEAT_SLUG = "resilient";

export function filterResilientAbilityOptionValues<
  T extends { valueId: string },
>(featSlug: string, values: T[], classSavingThrowSlugs: string[]): T[] {
  if (featSlug !== RESILIENT_FEAT_SLUG) return values;
  const blocked = new Set(classSavingThrowSlugs);
  return values.filter((item) => !blocked.has(item.valueId));
}
