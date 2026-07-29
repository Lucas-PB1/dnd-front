import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
  BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
  previewBackgroundAbilityBoosts,
} from "@/entities/character/lib/background-boost";
import { previewFeatAbilityBoosts } from "@/entities/character/lib/feat-ability-boost";
import { abilityModifierValue } from "@/entities/character";
import type { CharacterDetail } from "@/entities/character/types";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";

type AbilityPreviewInput = Pick<
  CreateCharacterInput,
  | "abilityScores"
  | "backgroundAbilityBoostMode"
  | "backgroundAbilityBoostPlus2Slug"
  | "backgroundAbilityBoostPlus1Slug"
  | "backgroundAbilityBoostPlus1Slugs"
  | "featOptions"
>;

export function previewCreateCharacterAbilityScores(
  values: AbilityPreviewInput,
  epicBoonFeatSlugs: ReadonlySet<string>,
): CreateCharacterInput["abilityScores"] {
  const mode =
    values.backgroundAbilityBoostMode ?? BACKGROUND_BOOST_MODE_PLUS2_PLUS1;
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const plus1Slugs = values.backgroundAbilityBoostPlus1Slugs ?? [];
  const afterBackground =
    mode === BACKGROUND_BOOST_MODE_PLUS1X3 &&
    plus1Slugs.filter(Boolean).length === 3 &&
    new Set(plus1Slugs.filter(Boolean)).size === 3
      ? previewBackgroundAbilityBoosts(values.abilityScores, {
          mode: BACKGROUND_BOOST_MODE_PLUS1X3,
          plus1Slugs: plus1Slugs as (keyof typeof values.abilityScores)[],
        })
      : mode === BACKGROUND_BOOST_MODE_PLUS2_PLUS1 &&
          plus2 &&
          plus1 &&
          plus2 !== plus1
        ? previewBackgroundAbilityBoosts(values.abilityScores, {
            mode: BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
            plus2Slug: plus2 as keyof typeof values.abilityScores,
            plus1Slug: plus1 as keyof typeof values.abilityScores,
          })
        : values.abilityScores;
  return previewFeatAbilityBoosts(
    afterBackground,
    values.featOptions ?? [],
    epicBoonFeatSlugs,
  );
}

/** Monta um CharacterDetail mínimo para labels/preview no passo de revisão. */
export function previewCreateCharacter(
  values: CreateCharacterInput,
  epicBoonFeatSlugs: ReadonlySet<string>,
): CharacterDetail {
  const mode =
    values.backgroundAbilityBoostMode ?? BACKGROUND_BOOST_MODE_PLUS2_PLUS1;
  const finalScores = previewCreateCharacterAbilityScores(
    values,
    epicBoonFeatSlugs,
  );

  return {
    id: "",
    name: values.name,
    level: values.level,
    classSlug: values.classSlug,
    speciesSlug: values.speciesSlug,
    backgroundSlug: values.backgroundSlug,
    subclassSlug: values.subclassSlug?.trim() ? values.subclassSlug : null,
    alignmentSlug: values.alignmentSlug?.trim()
      ? values.alignmentSlug.trim()
      : null,
    abilityScores: finalScores,
    hitPointsMax: null,
    hitPointsCurrent: null,
    proficiencyBonus: 0,
    classSkillSlugs: values.classSkillSlugs,
    backgroundSkillSlugs: [],
    speciesChoices: values.speciesChoices,
    subclassOptions: values.subclassOptions,
    classOptions: values.classOptions ?? [],
    characterFeats: [],
    featOptions: values.featOptions,
    characterSpells: values.characterSpells,
    equipment: values.equipment,
    languageSlugs: values.languageSlugs,
    abilityGenerationMethodSlug: values.abilityGenerationMethodSlug,
    backgroundAbilityBoostMode: mode,
    backgroundAbilityBoostPlus2Slug:
      values.backgroundAbilityBoostPlus2Slug ?? null,
    backgroundAbilityBoostPlus1Slug:
      values.backgroundAbilityBoostPlus1Slug ?? null,
    backgroundAbilityBoostPlus1Slugs:
      mode === BACKGROUND_BOOST_MODE_PLUS1X3
        ? (values.backgroundAbilityBoostPlus1Slugs ?? null)
        : null,
    backgroundToolItemSlug: values.backgroundToolItemSlug?.trim()
      ? values.backgroundToolItemSlug.trim()
      : null,
    abilityModifiers: {
      forca: abilityModifierValue(finalScores.forca),
      destreza: abilityModifierValue(finalScores.destreza),
      constituicao: abilityModifierValue(finalScores.constituicao),
      inteligencia: abilityModifierValue(finalScores.inteligencia),
      sabedoria: abilityModifierValue(finalScores.sabedoria),
      carisma: abilityModifierValue(finalScores.carisma),
    },
    passivePerception: 10 + abilityModifierValue(finalScores.sabedoria),
    armorClass: 10 + abilityModifierValue(finalScores.destreza),
    armorClassNote: "Sem armadura",
    weaponAttacks: [],
    equipmentWarnings: [],
    cannotCastSpellsInArmor: false,
    speedPenaltyMeters: 0,
    itemSpeedBonusMeters: 0,
    spellcastingAbilitySlug: null,
    spellSaveDc: null,
    spellAttackBonus: null,
    campaigns: [],
    createdAt: "",
    updatedAt: "",
  };
}
