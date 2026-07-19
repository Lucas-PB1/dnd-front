import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SpeciesListResponse,
  SpeciesSummary,
  SpeciesTrait,
  SpeciesTraitChoice,
} from "@/entities/species/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";

export const speciesKeys = {
  all: ["species"] as const,
  list: () => [...speciesKeys.all, "list"] as const,
  listPage: (params: { page: number; limit: number; q: string }) =>
    [...speciesKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...speciesKeys.all, "detail", slug] as const,
  traits: (slug: string) => [...speciesKeys.all, "traits", slug] as const,
  traitChoices: (slug: string) =>
    [...speciesKeys.all, "trait-choices", slug] as const,
};

export async function fetchSpeciesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? 50,
    q: params?.q,
  });

  return catalogFetch<SpeciesListResponse>(
    `/species?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchSpecies(limit = 50) {
  return fetchSpeciesPage({ page: 1, limit });
}

export async function fetchSpeciesBySlug(slug: string) {
  return catalogFetch<SpeciesSummary>(`/species/${slug}`, CATALOG_FETCH_INIT);
}

export async function fetchSpeciesTraits(slug: string) {
  return catalogFetch<PaginatedResponse<SpeciesTrait>>(
    `/species/${slug}/traits`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchSpeciesTraitChoices(slug: string) {
  return catalogFetch<PaginatedResponse<SpeciesTraitChoice>>(
    `/species/${slug}/trait-choices`,
    CATALOG_FETCH_INIT,
  );
}
