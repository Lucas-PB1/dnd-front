import { z } from "zod";

import {
  MAGIC_ITEM_ROW_COUNT,
  SPELL_ROW_COUNT,
  SPELL_SLOT_LEVELS,
  WEAPON_ROW_COUNT,
} from "@/domain/character-sheet/constants";

const abilityScoreSchema = z.object({
  score: z.string(),
  modifier: z.string(),
});

const proficientModifierSchema = z.object({
  proficient: z.boolean(),
  modifier: z.string(),
});

const weaponRowSchema = z.object({
  name: z.string(),
  atkBonus: z.string(),
  damage: z.string(),
  notes: z.string(),
});

const spellRowSchema = z.object({
  name: z.string(),
  level: z.string(),
  castingTime: z.string(),
  range: z.string(),
  concentration: z.boolean(),
  ritual: z.boolean(),
  material: z.string(),
  notes: z.string(),
});

const spellSlotSchema = z.object({
  total: z.string(),
  expended: z.string(),
});

const magicItemRowSchema = z.object({
  name: z.string(),
  attuned: z.boolean(),
});

const abilitiesSchema = z.object({
  strength: abilityScoreSchema,
  dexterity: abilityScoreSchema,
  constitution: abilityScoreSchema,
  intelligence: abilityScoreSchema,
  wisdom: abilityScoreSchema,
  charisma: abilityScoreSchema,
});

const abilityBaseScoresSchema = z.object({
  strength: z.string(),
  dexterity: z.string(),
  constitution: z.string(),
  intelligence: z.string(),
  wisdom: z.string(),
  charisma: z.string(),
});

const savingThrowsSchema = z.object({
  strength: proficientModifierSchema,
  dexterity: proficientModifierSchema,
  constitution: proficientModifierSchema,
  intelligence: proficientModifierSchema,
  wisdom: proficientModifierSchema,
  charisma: proficientModifierSchema,
});

const skillsSchema = z.object({
  acrobatics: proficientModifierSchema,
  animalHandling: proficientModifierSchema,
  arcana: proficientModifierSchema,
  athletics: proficientModifierSchema,
  deception: proficientModifierSchema,
  history: proficientModifierSchema,
  insight: proficientModifierSchema,
  intimidation: proficientModifierSchema,
  investigation: proficientModifierSchema,
  medicine: proficientModifierSchema,
  nature: proficientModifierSchema,
  perception: proficientModifierSchema,
  performance: proficientModifierSchema,
  persuasion: proficientModifierSchema,
  religion: proficientModifierSchema,
  sleightOfHand: proficientModifierSchema,
  stealth: proficientModifierSchema,
  survival: proficientModifierSchema,
});

const spellSlotsSchema = z.object({
  "1": spellSlotSchema,
  "2": spellSlotSchema,
  "3": spellSlotSchema,
  "4": spellSlotSchema,
  "5": spellSlotSchema,
  "6": spellSlotSchema,
  "7": spellSlotSchema,
  "8": spellSlotSchema,
  "9": spellSlotSchema,
});

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

const emptyAbility = { score: "", modifier: "" };
const emptyProficiency = { proficient: false, modifier: "" };
const emptyWeapon = { name: "", atkBonus: "", damage: "", notes: "" };
const emptySpell = {
  name: "",
  level: "",
  castingTime: "",
  range: "",
  concentration: false,
  ritual: false,
  material: "",
  notes: "",
};
const emptySpellSlot = { total: "", expended: "" };
const emptyMagicItem = { name: "", attuned: false };

export const EMPTY_CHARACTER_SHEET: CharacterSheet = {
  characterName: "",
  species: "",
  characterClass: "",
  characterLevel: "",
  subclass: "",
  experiencePoints: "",
  background: "",
  alignment: "",
  classSkillChoices: [],
  backgroundAbilityMode: "split",
  backgroundAbilityPlus2: "",
  backgroundAbilityPlus1: "",
  speciesSkillChoice: "",
  speciesOriginFeat: "",
  armorClass: "",
  initiative: "",
  speed: "",
  size: "",
  passivePerception: "",
  proficiencyBonus: "",
  heroicInspiration: false,
  shield: "",
  hitPointsMax: "",
  hitPointsCurrent: "",
  hitPointsTemp: "",
  hitDice: "",
  hitDiceSpent: "",
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  abilities: {
    strength: emptyAbility,
    dexterity: emptyAbility,
    constitution: emptyAbility,
    intelligence: emptyAbility,
    wisdom: emptyAbility,
    charisma: emptyAbility,
  },
  abilityBaseScores: {
    strength: "",
    dexterity: "",
    constitution: "",
    intelligence: "",
    wisdom: "",
    charisma: "",
  },
  savingThrows: {
    strength: emptyProficiency,
    dexterity: emptyProficiency,
    constitution: emptyProficiency,
    intelligence: emptyProficiency,
    wisdom: emptyProficiency,
    charisma: emptyProficiency,
  },
  skills: {
    acrobatics: emptyProficiency,
    animalHandling: emptyProficiency,
    arcana: emptyProficiency,
    athletics: emptyProficiency,
    deception: emptyProficiency,
    history: emptyProficiency,
    insight: emptyProficiency,
    intimidation: emptyProficiency,
    investigation: emptyProficiency,
    medicine: emptyProficiency,
    nature: emptyProficiency,
    perception: emptyProficiency,
    performance: emptyProficiency,
    persuasion: emptyProficiency,
    religion: emptyProficiency,
    sleightOfHand: emptyProficiency,
    stealth: emptyProficiency,
    survival: emptyProficiency,
  },
  tools: "",
  weaponsProficiency: "",
  armorProficiency: "",
  training: "",
  armorTrainingLight: false,
  armorTrainingMedium: false,
  armorTrainingHeavy: false,
  armorTrainingShields: false,
  feats: "",
  classFeatures: "",
  speciesTraits: "",
  cantrips: "",
  weapons: Array.from({ length: WEAPON_ROW_COUNT }, () => ({ ...emptyWeapon })),
  spellcastingAbility: "",
  spellcastingModifier: "",
  spellSaveDc: "",
  spellAttackBonus: "",
  spells: Array.from({ length: SPELL_ROW_COUNT }, () => ({ ...emptySpell })),
  spellSlots: Object.fromEntries(
    SPELL_SLOT_LEVELS.map((level) => [String(level), { ...emptySpellSlot }]),
  ) as CharacterSheet["spellSlots"],
  equipment: "",
  coinsCp: "",
  coinsSp: "",
  coinsEp: "",
  coinsGp: "",
  coinsPp: "",
  appearance: "",
  backstory: "",
  languages: "",
  magicItems: Array.from({ length: MAGIC_ITEM_ROW_COUNT }, () => ({
    ...emptyMagicItem,
  })),
};

export function createEmptyCharacterSheet(): CharacterSheet {
  return structuredClone(EMPTY_CHARACTER_SHEET);
}
