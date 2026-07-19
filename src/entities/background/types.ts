import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type BackgroundSummary = {
  slug: string;
  name: string;
  tagline: string | null;
  summary: string | null;
  description: string | null;
  equipmentGoldOption: number | null;
  abilityOptionSlugs: string[];
  abilityOptionNames: string[];
  originFeatSlug: string | null;
  originFeatName: string | null;
  toolProficiencyKind: string | null;
  toolProficiencyDescription: string | null;
  toolItemSlug: string | null;
  toolItemName: string | null;
  toolCategorySlug: string | null;
  toolCategoryName: string | null;
  sourceChapter: number | null;
  sourceChapterTitle: string | null;
  editionSlug: string | null;
};

/** Espelha BackgroundToolResponseDto */
export type BackgroundToolOption = {
  itemSlug: string;
  itemName: string;
  categorySlug: string;
  categoryName: string;
};

export type BackgroundListResponse = PaginatedResponse<BackgroundSummary>;

/** Espelha BackgroundEquipmentResponseDto */
export type BackgroundEquipmentOption = {
  packageSlug: string;
  packageLabel: string;
  packageGold: number | null;
  sortOrder: number;
  itemSlug: string | null;
  itemName: string | null;
  quantity: number | null;
  choiceText: string | null;
};

/** Espelha BackgroundSkillResponseDto */
export type BackgroundSkillOption = {
  slug: string;
  name: string;
};
