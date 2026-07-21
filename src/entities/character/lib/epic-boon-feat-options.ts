export const EPIC_BOON_FEAT_CATEGORY = "epic-boon";

export const STANDARD_ABILITY_SCORE_CAP = 20;
export const EPIC_BOON_ABILITY_SCORE_CAP = 30;

export function abilityScoreCapForFeat(
  featSlug: string,
  epicBoonFeatSlugs: ReadonlySet<string> | undefined,
): number {
  if (epicBoonFeatSlugs?.has(featSlug)) {
    return EPIC_BOON_ABILITY_SCORE_CAP;
  }
  return STANDARD_ABILITY_SCORE_CAP;
}

export function epicBoonFeatSlugsFromCatalog(
  feats: { slug: string; categorySlug: string }[],
): Set<string> {
  return new Set(
    feats
      .filter((feat) => feat.categorySlug === EPIC_BOON_FEAT_CATEGORY)
      .map((feat) => feat.slug),
  );
}
