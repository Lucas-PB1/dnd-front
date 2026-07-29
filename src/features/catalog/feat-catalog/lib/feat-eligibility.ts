import type { AbilityScores } from "@/entities/character/types";
import type { FeatSummary } from "@/entities/feat/types";

type FeatRequirements = Pick<
  FeatSummary,
  | "minimumLevel"
  | "abilityPrerequisites"
  | "requiresSpellcasting"
  | "requiredArmorTrainingSlug"
  | "requiresFightingStyle"
>;

export type FeatEligibilityContext = {
  level: number;
  abilityScores: AbilityScores;
  hasSpellcasting: boolean;
  armorTrainingSlugs: readonly string[];
  hasFightingStyleFeature: boolean;
};

export function meetsFeatRequirements(
  feat: FeatRequirements,
  context: FeatEligibilityContext,
): boolean {
  if (feat.minimumLevel !== null && context.level < feat.minimumLevel) {
    return false;
  }

  const meetsAnAbilityRequirement =
    feat.abilityPrerequisites.length === 0 ||
    feat.abilityPrerequisites.some(
      ({ abilitySlug, minimumScore }) =>
        context.abilityScores[abilitySlug] >= minimumScore,
    );
  if (!meetsAnAbilityRequirement) return false;

  if (feat.requiresSpellcasting && !context.hasSpellcasting) return false;
  if (
    feat.requiredArmorTrainingSlug &&
    !context.armorTrainingSlugs.includes(feat.requiredArmorTrainingSlug)
  ) {
    return false;
  }

  return !feat.requiresFightingStyle || context.hasFightingStyleFeature;
}
