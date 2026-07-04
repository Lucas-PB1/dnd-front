import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha AlignmentResponseDto da dnd-api */
export type AlignmentSummary = {
  slug: string;
  name: string;
  abbreviation: string | null;
  description: string | null;
};

export type AlignmentListResponse = PaginatedResponse<AlignmentSummary>;
