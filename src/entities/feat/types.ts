import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type FeatBenefit = {
  name?: string;
  description?: string;
};

/** Espelha FeatResponseDto da dnd-api */
export type FeatSummary = {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  categoryTypeLabel: string;
  repeatable: boolean;
  prerequisite: string | null;
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
