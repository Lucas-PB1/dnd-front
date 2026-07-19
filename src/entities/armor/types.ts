import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha ArmorResponseDto */
export type ArmorSummary = {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  donDoff: string | null;
  acBase: number | null;
  acFormula: string | null;
  strengthReq: number | null;
  stealthDisadvantage: boolean;
};

export type ArmorListResponse = PaginatedResponse<ArmorSummary>;
