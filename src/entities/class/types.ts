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
