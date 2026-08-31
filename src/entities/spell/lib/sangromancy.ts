export const SANGROMANCY_SAVANT_OPTION_KEYS = [
  "sangromancySavant1",
  "sangromancySavant2",
  "sangromancySavant3",
  "sangromancySavant4",
  "sangromancySavant5",
  "sangromancySavant6",
  "sangromancySavant7",
  "sangromancySavant8",
  "sangromancySavant9",
] as const;

export const SANGROMANCY_SAVANT_OPTION_KEY_SET = new Set<string>(
  SANGROMANCY_SAVANT_OPTION_KEYS,
);

export const SANGROMANCER_SUBCLASS_SLUG = "sangromancer";

export const SANGUINE_THIEF_SUBCLASS_SLUG = "sanguine-thief";

export function isSangromancySavantOptionKey(optionKey: string): boolean {
  return SANGROMANCY_SAVANT_OPTION_KEY_SET.has(optionKey);
}

export function isSangromancerWizard(
  classSlug: string,
  subclassSlug: string,
): boolean {
  return classSlug === "wizard" && subclassSlug === SANGROMANCER_SUBCLASS_SLUG;
}

export function usesWizardPlusSangromancyList(
  classSlug: string,
  subclassSlug: string,
): boolean {
  return (
    isSangromancerWizard(classSlug, subclassSlug) ||
    (classSlug === "rogue" && subclassSlug === SANGUINE_THIEF_SUBCLASS_SLUG)
  );
}
