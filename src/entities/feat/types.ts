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
  requiresWeaponMastery: boolean;
  /** Talentos que devem constar na ficha antes deste. */
  requiredFeatSlugs: string[];
  /** Perícias exigidas (todas). */
  requiredSkillSlugs: string[];
  /** Espécies aceitas (qualquer uma). */
  requiredSpeciesSlugs: string[];
  /** Proficiências de arma exigidas (todas). */
  requiredWeaponProficiencySlugs: string[];
  /** Opções de talento já adquirido exigidas. */
  requiredFeatOptions: {
    featSlug: string;
    optionKey: string;
    valueId: string;
  }[];
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
  benefit?: string | null;
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
