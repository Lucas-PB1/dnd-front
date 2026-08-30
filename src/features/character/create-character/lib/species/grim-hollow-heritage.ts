export const GH_HERITAGE_TRAIT_INDEX_SLUG = "gh-heritage-traits";

const GH_HERITAGE_TRAIT_SLOT_PREFIX = "gh_heritage_trait_";

export function isGrimHollowHeritageSlug(
  speciesSlug: string | null | undefined,
): boolean {
  const slug = speciesSlug?.trim() ?? "";
  return slug.startsWith("gh-") && slug !== GH_HERITAGE_TRAIT_INDEX_SLUG;
}

export function isGhHeritageTraitSlot(choiceKind: string): boolean {
  return choiceKind.startsWith(GH_HERITAGE_TRAIT_SLOT_PREFIX);
}

export function ghHeritageTraitSlotNumber(choiceKind: string): number | null {
  const match = choiceKind.match(/^gh_heritage_trait_(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : null;
}
