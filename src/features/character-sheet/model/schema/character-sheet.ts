import { z } from "zod";

import {
  MAGIC_ITEM_ROW_COUNT,
  SPELL_ROW_COUNT,
  WEAPON_ROW_COUNT,
} from "@/entities/character-sheet/constants";

import {
  abilitiesSchema,
  abilityBaseScoresSchema,
  savingThrowsSchema,
  skillsSchema,
  spellSlotsSchema,
} from "@/features/character-sheet/model/schema/ability-schemas";
import {
  magicItemRowSchema,
  spellRowSchema,
  weaponRowSchema,
} from "@/features/character-sheet/model/schema/field-schemas";

export const characterSheetSchema = z.object({
  characterName: z.string(),
  species: z.string(),
  characterClass: z.string(),
  characterLevel: z.string(),
  subclass: z.string(),
  experiencePoints: z.string(),
  background: z.string(),
  alignment: z.string(),
  classSkillChoices: z.array(z.string()),
  backgroundAbilityMode: z.enum(["split", "even"]),
  backgroundAbilityPlus2: z.string(),
  backgroundAbilityPlus1: z.string(),
  speciesSkillChoice: z.string(),
  speciesOriginFeat: z.string(),

  armorClass: z.string(),
  initiative: z.string(),
  speed: z.string(),
  size: z.string(),
  passivePerception: z.string(),
  proficiencyBonus: z.string(),
  heroicInspiration: z.boolean(),
  shield: z.string(),

  hitPointsMax: z.string(),
  hitPointsCurrent: z.string(),
  hitPointsTemp: z.string(),
  hitDice: z.string(),
  hitDiceSpent: z.string(),

  deathSaveSuccesses: z.number().int().min(0).max(3),
  deathSaveFailures: z.number().int().min(0).max(3),

  abilities: abilitiesSchema,
  abilityBaseScores: abilityBaseScoresSchema,
  savingThrows: savingThrowsSchema,
  skills: skillsSchema,

  tools: z.string(),
  weaponsProficiency: z.string(),
  armorProficiency: z.string(),
  training: z.string(),
  armorTrainingLight: z.boolean(),
  armorTrainingMedium: z.boolean(),
  armorTrainingHeavy: z.boolean(),
  armorTrainingShields: z.boolean(),

  feats: z.string(),
  classFeatures: z.string(),
  speciesTraits: z.string(),
  cantrips: z.string(),

  weapons: z.array(weaponRowSchema).length(WEAPON_ROW_COUNT),

  spellcastingAbility: z.string(),
  spellcastingModifier: z.string(),
  spellSaveDc: z.string(),
  spellAttackBonus: z.string(),

  spells: z.array(spellRowSchema).length(SPELL_ROW_COUNT),

  spellSlots: spellSlotsSchema,

  equipment: z.string(),
  coinsCp: z.string(),
  coinsSp: z.string(),
  coinsEp: z.string(),
  coinsGp: z.string(),
  coinsPp: z.string(),

  appearance: z.string(),
  backstory: z.string(),
  languages: z.string(),

  magicItems: z.array(magicItemRowSchema).length(MAGIC_ITEM_ROW_COUNT),
});

export type CharacterSheet = z.infer<typeof characterSheetSchema>;
