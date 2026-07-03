import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type SpeciesSummary = {
  slug: string;
  name: string;
  creatureType: string;
  size: string;
  speed: string;
  description: string;
};

export type SpeciesListResponse = PaginatedResponse<SpeciesSummary>;
