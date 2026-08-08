import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import type { AbilityScores } from "@/entities/character/types";

export type FeatBenefit = {
  name?: string;
  description?: string;
};

/** Resposta de `GET /feats?fields=summary`. */
export type FeatCatalogLabel = {
  slug: string;
  name: string;
  categorySlug: string;
};

export type FeatCatalogLabelListResponse = PaginatedResponse<FeatCatalogLabel>;

/** Espelha FeatResponseDto da dnd-api */
export type FeatSummary = {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  categoryTypeLabel: string;
  repeatable: boolean;
  prerequisite: string | null;
  minimumLevel: number | null;
  abilityPrerequisites: {
    abilitySlug: keyof AbilityScores;
    minimumScore: number;
  }[];
  requiresSpellcasting: boolean;
  requiredArmorTrainingSlug: string | null;
  requiresFightingStyle: boolean;
  sourceChapter: number | null;
  sourceChapterTitle: string | null;
  editionSlug: string | null;
  benefits: FeatBenefit[];
};

export type FeatListResponse = PaginatedResponse<FeatSummary>;

export type FeatOptionValue = {
  valueId: string;
  label: string;
  sortOrder: number;
};

export type FeatOptionDefinition = {
  optionKey: string;
  label: string;
  valueType: string;
  sortOrder: number;
  dependsOnOptionKey: string | null;
  spellMaxLevel: number | null;
  spellSchoolSlugs: string[] | null;
  spellRitualOnly: boolean;
  values: FeatOptionValue[];
};

export type FeatOptionListResponse = PaginatedResponse<FeatOptionDefinition>;
