import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha ClassResponseDto da dnd-api */
export type ClassSummary = {
  slug: string;
  name: string;
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

/** Espelha SubclassResponseDto da dnd-api */
export type SubclassSummary = {
  slug: string;
  name: string;
  classSlug: string;
  className: string;
  tagline: string | null;
  summary: string | null;
  sourceChapter: number | null;
  editionSlug: string | null;
  spellSourceSlug: string | null;
  spellSourceLabel: string | null;
};

export type SubclassListResponse = PaginatedResponse<SubclassSummary>;

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

/** Espelha SubclassMechanicResponseDto */
export type SubclassMechanic = {
  classSlug: string;
  featureLevel: number;
  featureName: string;
  featureDescription: string;
  featureKind: string | null;
  optionKey: string | null;
  resourceSlug: string | null;
  resourceName: string | null;
  resourceUnlockLevel: number | null;
  maxFormula: string | null;
  fixedMax: number | null;
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
