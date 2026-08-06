/**
 * Espelha dnd-api `game/sheet/domain/character-check-bonuses.ts`.
 */

import { hasJackOfAllTrades } from "@/entities/character/lib/class-expertise-slots";

export const SKILL_SPECIES_CHOICE_KINDS = new Set([
  "human_skill",
  "elf_keen_senses",
]);

export const ALERT_FEAT_SLUG = "alert";
export const RESILIENT_FEAT_SLUG = "resilient";

export const PROF_OR_EXPERTISE_FEAT_OPTION_KEYS = new Set([
  "attentiveSkill",
  "vastKnowledgeSkill",
]);

export type SkillProficiencyRank =
  | "none"
  | "jack"
  | "proficient"
  | "expertise";

type FeatOptionLike = {
  featSlug: string;
  optionKey: string;
  valueId: string;
};

type SpeciesChoiceLike = {
  choiceKind: string;
  choiceSlug: string;
};

type CharacterFeatLike = {
  featSlug: string;
};

type ClassOptionLike = {
  optionKey: string;
  valueId: string;
};

export type SkillBonusSources = {
  classSkillSlugs?: readonly string[];
  backgroundSkillSlugs?: readonly string[];
  speciesChoices?: readonly SpeciesChoiceLike[];
  featOptions?: readonly FeatOptionLike[];
  classOptions?: readonly ClassOptionLike[];
  classSlug?: string | null;
  level?: number;
};

function isFeatSkillProficiencyOptionKey(optionKey: string): boolean {
  return (
    optionKey === "newSkill" ||
    optionKey.startsWith("proficiency") ||
    optionKey === "expertiseSkill" ||
    PROF_OR_EXPERTISE_FEAT_OPTION_KEYS.has(optionKey)
  );
}

export function collectFeatSkillOptionSlugs(
  featOptions: readonly FeatOptionLike[] | undefined,
): string[] {
  if (!featOptions?.length) return [];
  return featOptions
    .filter((option) => isFeatSkillProficiencyOptionKey(option.optionKey))
    .map((option) => option.valueId)
    .filter(Boolean);
}

export function collectSpeciesSkillSlugs(
  speciesChoices: readonly SpeciesChoiceLike[] | undefined,
): string[] {
  if (!speciesChoices?.length) return [];
  return speciesChoices
    .filter((choice) => SKILL_SPECIES_CHOICE_KINDS.has(choice.choiceKind))
    .map((choice) => choice.choiceSlug)
    .filter(Boolean);
}

export function collectClassExpertiseSkillSlugs(
  classOptions: readonly ClassOptionLike[] | undefined,
): string[] {
  if (!classOptions?.length) return [];
  return classOptions
    .filter(
      (option) =>
        option.optionKey.startsWith("expertiseSkill") && option.valueId,
    )
    .map((option) => option.valueId);
}

function collectPriorProficientSkillSlugs(input: SkillBonusSources): string[] {
  const featOptions = (input.featOptions ?? []).filter(
    (option) => !PROF_OR_EXPERTISE_FEAT_OPTION_KEYS.has(option.optionKey),
  );
  return [
    ...new Set([
      ...(input.classSkillSlugs ?? []),
      ...(input.backgroundSkillSlugs ?? []),
      ...collectSpeciesSkillSlugs(input.speciesChoices),
      ...collectFeatSkillOptionSlugs(featOptions),
    ]),
  ];
}

export function collectExpertiseSkillSlugs(
  input: SkillBonusSources,
): string[] {
  const prior = new Set(collectPriorProficientSkillSlugs(input));
  const result = new Set<string>(
    collectClassExpertiseSkillSlugs(input.classOptions),
  );

  for (const option of input.featOptions ?? []) {
    if (option.optionKey === "expertiseSkill" && option.valueId) {
      result.add(option.valueId);
    }
    if (
      PROF_OR_EXPERTISE_FEAT_OPTION_KEYS.has(option.optionKey) &&
      option.valueId &&
      prior.has(option.valueId)
    ) {
      result.add(option.valueId);
    }
  }

  return [...result];
}

export function collectProficientSkillSlugs(
  input: SkillBonusSources,
): string[] {
  return [
    ...new Set([
      ...collectPriorProficientSkillSlugs(input),
      ...collectFeatSkillOptionSlugs(
        (input.featOptions ?? []).filter((option) =>
          PROF_OR_EXPERTISE_FEAT_OPTION_KEYS.has(option.optionKey),
        ),
      ),
      ...collectClassExpertiseSkillSlugs(input.classOptions),
    ]),
  ];
}

export function skillProficiencyRank(
  skillSlug: string,
  input: SkillBonusSources,
): SkillProficiencyRank {
  const expertise = new Set(collectExpertiseSkillSlugs(input));
  if (expertise.has(skillSlug)) return "expertise";
  const proficient = new Set(collectProficientSkillSlugs(input));
  if (proficient.has(skillSlug)) return "proficient";
  if (hasJackOfAllTrades(input.classSlug, input.level ?? 0)) return "jack";
  return "none";
}

export function skillCheckBonus(
  abilityModifier: number,
  proficiencyBonus: number,
  rank: SkillProficiencyRank,
): number {
  if (rank === "expertise") return abilityModifier + proficiencyBonus * 2;
  if (rank === "proficient") return abilityModifier + proficiencyBonus;
  if (rank === "jack") {
    return abilityModifier + Math.floor(proficiencyBonus / 2);
  }
  return abilityModifier;
}

/** Passiva = 10 + bônus de perícia (inclui Jack of All Trades / expertise). */
export function computePassiveSkill(
  skillSlug: string,
  abilityScore: number,
  proficiencyBonus: number,
  sources: SkillBonusSources,
): number {
  const mod = Math.floor((abilityScore - 10) / 2);
  const rank = skillProficiencyRank(skillSlug, sources);
  return 10 + skillCheckBonus(mod, proficiencyBonus, rank);
}

export function collectSaveProficiencyAbilities(
  classSavingThrowSlugs: readonly string[],
  featOptions: readonly FeatOptionLike[] | undefined,
): string[] {
  const set = new Set<string>(classSavingThrowSlugs);
  for (const option of featOptions ?? []) {
    if (
      option.featSlug === RESILIENT_FEAT_SLUG &&
      option.optionKey === "abilityIncrease" &&
      option.valueId
    ) {
      set.add(option.valueId);
    }
  }
  return [...set];
}

export function hasAlertFeat(
  characterFeats: readonly CharacterFeatLike[] | undefined,
): boolean {
  return (characterFeats ?? []).some(
    (feat) => feat.featSlug === ALERT_FEAT_SLUG,
  );
}

export function initiativeBonus(
  dexterityModifier: number,
  proficiencyBonus: number,
  characterFeats: readonly CharacterFeatLike[] | undefined,
): number {
  return (
    dexterityModifier +
    (hasAlertFeat(characterFeats) ? proficiencyBonus : 0)
  );
}
