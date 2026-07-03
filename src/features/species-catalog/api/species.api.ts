import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SpeciesListResponse,
  SpeciesSummary,
} from "@/entities/species/types";

export const speciesKeys = {
  all: ["species"] as const,
  list: () => [...speciesKeys.all, "list"] as const,
  detail: (slug: string) => [...speciesKeys.all, "detail", slug] as const,
};

export async function fetchSpecies(limit = 50) {
  return catalogFetch<SpeciesListResponse>(`/species?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchSpeciesBySlug(slug: string) {
  return catalogFetch<SpeciesSummary>(`/species/${slug}`, {
    next: { revalidate: 3600 },
  });
}
