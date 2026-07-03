import { ABILITIES } from "@/entities/character-sheet/constants/abilities";
import {
  MAGIC_ITEM_ROW_COUNT,
  SPELL_ROW_COUNT,
  SPELL_SLOT_LEVELS,
  WEAPON_ROW_COUNT,
} from "@/entities/character-sheet/constants/sheet-layout";
import { SKILL_DEFINITIONS } from "@/entities/character-sheet/constants/skills";

import type { CharacterSheet } from "@/features/character-sheet/model/schema/character-sheet";

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

function abilityRecord<T>(
  factory: () => T,
): Record<(typeof ABILITIES)[number], T> {
  return Object.fromEntries(
    ABILITIES.map((ability) => [ability, factory()]),
  ) as Record<(typeof ABILITIES)[number], T>;
}

function skillRecord<T>(factory: () => T): CharacterSheet["skills"] {
  return Object.fromEntries(
    SKILL_DEFINITIONS.map((skill) => [skill.key, factory()]),
  ) as unknown as CharacterSheet["skills"];
}

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
  abilities: abilityRecord(() => ({ ...emptyAbility })),
  abilityBaseScores: abilityRecord(() => ""),
  savingThrows: abilityRecord(() => ({ ...emptyProficiency })),
  skills: skillRecord(() => ({ ...emptyProficiency })),
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
