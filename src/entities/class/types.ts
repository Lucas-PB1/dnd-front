import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type {
  SubclassSummary,
  SubclassListResponse,
  SubclassMechanic,
  SubclassMechanicListResponse,
} from "@/entities/subclass/types";

export type ClassSummary = {
  slug: string;
  name: string;
  tagline: string | null;
  summary: string | null;
  description: string | null;
  hitDie: string;
  primaryAbilityLabel: string | null;
  primaryAbilityOperator: string | null;
  primaryAbilitySlugs: string[];
  hpLevel1DieValue: number | null;
  hpFixedPerLevel: number | null;
  skillChoiceCount: number | null;
  skillChoiceFrom: string | null;
  weaponMasteryEligibility?: "any" | "melee" | null;
  sourceChapter: number | null;
  editionSlug: string | null;
  savingThrowSlugs?: string[];
  savingThrowNames?: string[];
  armorTrainingSlugs?: string[];
  armorTrainingNames?: string[];
  weaponProficiencySlugs?: string[];
  weaponProficiencyNames?: string[];
  fightingStyleSlugs?: string[];
  fightingStyleNames?: string[];
  subclassUnlockLevel?: number | null;
  jackOfAllTradesLevel?: number | null;
};

export type ClassListResponse = PaginatedResponse<ClassSummary>;

export type ClassSkillOption = {
  slug: string;
  name: string;
  skillChoiceCount: number | null;
  skillChoiceFrom: string | null;
};

export type ClassEquipmentOption = {
  packageSlug: string;
  packageLabel: string;
  sortOrder: number;
  itemSlug: string | null;
  itemName: string | null;
  quantity: number | null;
  choiceText: string | null;
  goldAmount: number | null;
};

export type ClassSpellOption = {
  slug: string;
  name: string;
  level: number;
  schoolSlug: string;
  schoolName: string;
};

export type ClassSpellSlots = {
  classLevel: number;
  patternSlug: string;
  patternName: string;
  proficiencyBonus?: number;
  cantrips?: number | null;
  preparedSpells?: number | null;
  channelDivinity?: number | null;
  spellSlots: Record<string, number>;
};

export type SubclassSpellSlots = ClassSpellSlots & {
  spellListClassSlug: string;
};

export type SubclassSpellcasting = {
  subclassSlug: string;
  castingType: string;
  abilitySlug: string | null;
  focusLabel: string | null;
  spellListClassSlug: string;
  spellSlotPatternSlug: string;
  ritual: boolean;
  spellcastingMode: "prepared" | "known" | "wizard";
};

export type ClassProgressionRow = {
  level: number;
  proficiencyBonus: number;
  cantrips: number | null;
  preparedSpells: number | null;
  channelDivinity: number | null;
  weaponMastery: number | null;
  asiOrFeat?: boolean;
};

export type ClassFeature = {
  classSlug: string;
  featureLevel: number;
  featureName: string;
  featureDescription: string;
};

export type SubclassSpellOption = {
  unlockLevel: number;
  slug: string;
  name: string;
  terrainSlug: string | null;
  terrainLabel: string | null;
};

export type SubclassOptionValue = {
  valueId: string;
  label: string;
  sortOrder: number;
  benefit?: string | null;
};

export type SubclassOptionGroup = {
  optionKey: string;
  label: string;
  unlockLevel: number;
  valueType: string;
  values: SubclassOptionValue[];
  spellMaxLevel?: number | null;
  spellSchoolSlugs?: string[] | null;
};

export type ClassFeatureOptionValue = SubclassOptionValue & {
  benefit?: string | null;
};

export type ClassFeatureOptionGroup = {
  optionKey: string;
  label: string;
  unlockLevel: number;
  valueType: string;
  values: ClassFeatureOptionValue[];
};
