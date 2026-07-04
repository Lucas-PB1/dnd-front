import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha AbilityGenerationMethodResponseDto da dnd-api */
export type AbilityGenerationMethod = {
  slug: string;
  name: string;
  description: string;
};

export type AbilityGenerationMethodListResponse =
  PaginatedResponse<AbilityGenerationMethod>;
