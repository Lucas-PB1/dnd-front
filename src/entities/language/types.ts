import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha LanguageResponseDto da dnd-api */
export type LanguageSummary = {
  slug: string;
  name: string;
  script: string | null;
  typicalSpeakers: string | null;
  isRare: boolean;
};

export type LanguageListResponse = PaginatedResponse<LanguageSummary>;
