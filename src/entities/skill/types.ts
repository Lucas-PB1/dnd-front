import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha SkillResponseDto da dnd-api */
export type SkillSummary = {
  slug: string;
  name: string;
  abilitySlug: string;
  abilityName: string;
  description: string | null;
};

export type SkillListResponse = PaginatedResponse<SkillSummary>;
