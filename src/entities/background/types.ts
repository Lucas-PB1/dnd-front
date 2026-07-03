import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type BackgroundSummary = {
  slug: string;
  name: string;
  equipmentGoldOption: number | null;
  abilityOptionSlugs: string[];
  abilityOptionNames: string[];
  sourceChapter: number | null;
  sourceChapterTitle: string | null;
  editionSlug: string | null;
};

export type BackgroundListResponse = PaginatedResponse<BackgroundSummary>;
