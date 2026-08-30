import type { AbilityScores } from "@/entities/character/types";
import type { FeatSummary } from "@/entities/feat/types";

type FeatRequirements = Pick<
  FeatSummary,
  | "minimumLevel"
  | "abilityPrerequisites"
  | "requiresSpellcasting"
  | "requiredArmorTrainingSlug"
  | "requiresFightingStyle"
  | "requiresWeaponMastery"
  | "requiredFeatSlugs"
  | "requiredSkillSlugs"
  | "requiredSpeciesSlugs"
  | "requiredWeaponProficiencySlugs"
  | "requiredFeatOptions"
>;

export type FeatEligibilityContext = {
  level: number;
  abilityScores: AbilityScores;
  hasSpellcasting: boolean;
  armorTrainingSlugs: readonly string[];
  hasFightingStyleFeature: boolean;
  hasWeaponMasteryFeature?: boolean;
  /** Talentos já na ficha (origem, ASI, estilo de luta, etc.). */
  ownedFeatSlugs?: readonly string[];
  skillSlugs?: readonly string[];
  speciesSlug?: string | null;
  weaponProficiencySlugs?: readonly string[];
  ownedFeatOptions?: readonly {
    featSlug: string;
    optionKey: string;
    valueId: string;
  }[];
};

function hasWeaponProficiency(
  requiredSlug: string,
  ownedSlugs: readonly string[],
  ownedFeatSlugs: readonly string[],
): boolean {
  if (ownedSlugs.includes(requiredSlug)) return true;
  if (
    requiredSlug === "armas-marciais" &&
    ownedFeatSlugs.includes("martial-weapon-training")
  ) {
    return true;
  }
  if (
    requiredSlug === "armas-avancadas" &&
    ownedFeatSlugs.includes("advanced-weapon-proficiency")
  ) {
    return true;
  }
  // Machadinhas cobertas por armas simples
  if (requiredSlug === "machadinhas" && ownedSlugs.includes("armas-simples")) {
    return true;
  }
  return false;
}

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

  if (feat.requiresFightingStyle && !context.hasFightingStyleFeature) {
    return false;
  }

  if (feat.requiresWeaponMastery && !context.hasWeaponMasteryFeature) {
    return false;
  }

  const ownedFeatSlugs = context.ownedFeatSlugs ?? [];
  const requiredFeats = feat.requiredFeatSlugs ?? [];
  if (requiredFeats.length > 0) {
    const owned = new Set(ownedFeatSlugs);
    if (!requiredFeats.every((slug) => owned.has(slug))) return false;
  }

  const requiredSkills = feat.requiredSkillSlugs ?? [];
  if (requiredSkills.length > 0) {
    const skills = new Set(context.skillSlugs ?? []);
    if (!requiredSkills.every((slug) => skills.has(slug))) return false;
  }

  const requiredSpecies = feat.requiredSpeciesSlugs ?? [];
  if (requiredSpecies.length > 0) {
    const species = context.speciesSlug?.trim() ?? "";
    if (!species || !requiredSpecies.includes(species)) return false;
  }

  const requiredWeaponProfs = feat.requiredWeaponProficiencySlugs ?? [];
  if (requiredWeaponProfs.length > 0) {
    const weaponProfs = context.weaponProficiencySlugs ?? [];
    if (
      !requiredWeaponProfs.every((slug) =>
        hasWeaponProficiency(slug, weaponProfs, ownedFeatSlugs),
      )
    ) {
      return false;
    }
  }

  const requiredFeatOptions = feat.requiredFeatOptions ?? [];
  if (requiredFeatOptions.length > 0) {
    const options = context.ownedFeatOptions ?? [];
    if (
      !requiredFeatOptions.every((required) =>
        options.some(
          (owned) =>
            owned.featSlug === required.featSlug &&
            owned.optionKey === required.optionKey &&
            owned.valueId === required.valueId,
        ),
      )
    ) {
      return false;
    }
  }

  return true;
}
