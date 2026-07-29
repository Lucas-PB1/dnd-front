import { canAddCharacterFeat } from "@/entities/character/lib/character-feat";
import type { CharacterFeat } from "@/entities/character/lib/character-feat";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import {
  FIGHTING_STYLE_FEAT_CATEGORY,
  collectTakenFightingStyleSlugs,
} from "@/features/catalog/feat-catalog/lib/fighting-style-feat-options";
import {
  meetsFeatRequirements,
  type FeatEligibilityContext,
} from "@/features/catalog/feat-catalog/lib/feat-eligibility";
import type { FeatSummary } from "@/entities/feat/types";

const ASI_FEAT_SLUG = "ability-score-improvement";

type FeatCatalogRow = Pick<
  FeatSummary,
  | "slug"
  | "name"
  | "repeatable"
  | "categorySlug"
  | "minimumLevel"
  | "abilityPrerequisites"
  | "requiresSpellcasting"
  | "requiredArmorTrainingSlug"
  | "requiresFightingStyle"
>;

type SubclassOption = { optionKey: string; valueId: string };

export { ASI_FEAT_SLUG };

export function sortedAsiSlotFeatOptions(args: {
  slotIndex: number;
  asiFeatSlotSlugs: string[];
  originFeatSlug: string | null;
  speciesChoices: { choiceKind: string; choiceSlug: string }[];
  fightingStyleSlug: string;
  fightingStyleFeatSlugs: Set<string>;
  subclassOptions: SubclassOption[];
  classFightingStyleSlugs: string[];
  feats: FeatCatalogRow[];
  eligibility: FeatEligibilityContext;
}): FeatCatalogRow[] {
  const {
    slotIndex,
    asiFeatSlotSlugs,
    originFeatSlug,
    speciesChoices,
    fightingStyleSlug,
    fightingStyleFeatSlugs,
    subclassOptions,
    classFightingStyleSlugs,
    feats,
    eligibility,
  } = args;

  const otherSlots = asiFeatSlotSlugs.map((slug, index) =>
    index === slotIndex ? "" : slug,
  );
  const otherFeats = asiFeatSlotsToCharacterFeats(otherSlots);
  const previewWithoutSlot = resolveCreateCharacterFeats(
    originFeatSlug,
    otherFeats,
    speciesChoices,
  );
  const currentSlotSlug = asiFeatSlotSlugs[slotIndex] ?? "";
  const takenStyles = collectTakenFightingStyleSlugs({
    characterFeatSlugs: [
      ...previewWithoutSlot.map((feat: CharacterFeat) => feat.featSlug),
      ...(fightingStyleSlug ? [fightingStyleSlug] : []),
    ],
    fightingStyleFeatSlugs,
    subclassOptions,
  });
  const allowedStyles = new Set(classFightingStyleSlugs);

  const list = feats.filter((feat) => {
    if (!canAddCharacterFeat(previewWithoutSlot, feat.slug)) {
      return false;
    }
    const categoryAllowed =
      feat.categorySlug === "general" ||
      (feat.categorySlug === "epic-boon" && eligibility.level >= 19) ||
      feat.categorySlug === FIGHTING_STYLE_FEAT_CATEGORY;
    if (!categoryAllowed || !meetsFeatRequirements(feat, eligibility)) {
      return false;
    }
    if (feat.categorySlug !== FIGHTING_STYLE_FEAT_CATEGORY) {
      return true;
    }
    if (feat.slug === currentSlotSlug) {
      return allowedStyles.has(feat.slug);
    }
    return allowedStyles.has(feat.slug) && !takenStyles.includes(feat.slug);
  });

  const asiFeat = list.find((f) => f.slug === ASI_FEAT_SLUG);
  const rest = list
    .filter((f) => f.slug !== ASI_FEAT_SLUG)
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));
  return asiFeat ? [asiFeat, ...rest] : rest;
}
