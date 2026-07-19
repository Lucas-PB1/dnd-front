import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type {
  SubclassSummary,
  SubclassListResponse,
  SubclassMechanic,
  SubclassMechanicListResponse,
} from "@/entities/subclass/types";

/** Espelha ClassResponseDto da dnd-api */
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
  sourceChapter: number | null;
  editionSlug: string | null;
};

export type ClassListResponse = PaginatedResponse<ClassSummary>;

/** Espelha ClassSkillResponseDto */
export type ClassSkillOption = {
  slug: string;
  name: string;
  skillChoiceCount: number | null;
  skillChoiceFrom: string | null;
};

/** Espelha ClassEquipmentResponseDto */
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

/** Espelha ClassSpellResponseDto */
export type ClassSpellOption = {
  slug: string;
  name: string;
  level: number;
  schoolSlug: string;
  schoolName: string;
};

/** Espelha ClassSpellSlotsResponseDto */
export type ClassSpellSlots = {
  classLevel: number;
  patternSlug: string;
  patternName: string;
  spellSlots: Record<string, number>;
};

/** Espelha ClassFeatureResponseDto */
export type ClassFeature = {
  classSlug: string;
  featureLevel: number;
  featureName: string;
  featureDescription: string;
};

/** Espelha SubclassSpellResponseDto */
export type SubclassSpellOption = {
  unlockLevel: number;
  slug: string;
  name: string;
  terrainSlug: string | null;
  terrainLabel: string | null;
};

/** Espelha SubclassOptionResponseDto */
export type SubclassOptionValue = {
  valueId: string;
  label: string;
  sortOrder: number;
};

export type SubclassOptionGroup = {
  optionKey: string;
  label: string;
  unlockLevel: number;
  values: SubclassOptionValue[];
};
