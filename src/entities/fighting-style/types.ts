import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha FightingStyleResponseDto */
export type FightingStyleSummary = {
  slug: string;
  name: string;
  description: string;
};

export type FightingStyleListResponse = PaginatedResponse<FightingStyleSummary>;
