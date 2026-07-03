import type { Ability } from "@/entities/character-sheet/constants/abilities";
import type { SkillKey } from "@/entities/character-sheet/constants/skills";
import type { CharacterClassId } from "@/entities/character-sheet/data/classes/definitions";

export type ClassArmorTraining = {
  light: boolean;
  medium: boolean;
  heavy: boolean;
  shields: boolean;
};

export type ClassProficienciesDefinition = {
  id: CharacterClassId;
  savingThrows: readonly Ability[];
  skillChoiceCount: number;
  skillChoices: readonly SkillKey[] | "any";
  weaponsLabel: string;
  armorLabel: string;
  toolsLabel?: string;
  armorTraining: ClassArmorTraining;
  hitDie: string;
};

export type SubclassDetail = {
  id: string;
  summary: string;
};

export type ClassDetail = {
  id: CharacterClassId;
  tagline: string;
  summary: string;
  primaryAbility: string;
  hitDie: string;
  savingThrows: string;
  subclassUnlockLevel: number;
  subclasses: SubclassDetail[];
};
