import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SpeciesListResponse,
  SpeciesSummary,
  SpeciesTrait,
  SpeciesTraitChoice,
} from "@/entities/species/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export const speciesKeys = {
  all: ["species"] as const,
  list: () => [...speciesKeys.all, "list"] as const,
  detail: (slug: string) => [...speciesKeys.all, "detail", slug] as const,
  traits: (slug: string) => [...speciesKeys.all, "traits", slug] as const,
  traitChoices: (slug: string) =>
    [...speciesKeys.all, "trait-choices", slug] as const,
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

export async function fetchSpeciesTraits(slug: string) {
  return catalogFetch<PaginatedResponse<SpeciesTrait>>(
    `/species/${slug}/traits`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchSpeciesTraitChoices(slug: string) {
  return catalogFetch<PaginatedResponse<SpeciesTraitChoice>>(
    `/species/${slug}/trait-choices`,
    { next: { revalidate: 3600 } },
  );
}
