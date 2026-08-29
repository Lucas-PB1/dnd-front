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
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";

const FETCH_PAGE_SIZE = 100;

export const speciesKeys = {
  all: ["species"] as const,
  list: () => [...speciesKeys.all, "list"] as const,
  detail: (slug: string, editionSlugs?: string) =>
    [...speciesKeys.all, "detail", slug, editionSlugs ?? "all"] as const,
  traits: (slug: string) => [...speciesKeys.all, "traits", slug] as const,
  traitChoices: (slug: string, editionSlugs?: string) =>
    [...speciesKeys.all, "trait-choices", slug, editionSlugs ?? "all"] as const,
};

export async function fetchSpeciesPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? 50,
    cursor: params?.cursor,
    q: params?.q,
    filters: {
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<SpeciesListResponse>(
    `/species?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllSpecies(params?: {
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  return fetchAllCatalogPages<SpeciesListResponse["data"][number]>(
    ({ page, limit, cursor }) =>
      fetchSpeciesPage({ ...params, page, limit, cursor }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchSpecies(
  _limit = 50,
  editionSlugs?: string,
  fields?: "summary",
) {
  return fetchAllSpecies({ editionSlugs, fields });
}

export async function fetchSpeciesBySlug(slug: string, editionSlugs?: string) {
  const search = buildCatalogSearchParams({
    filters: { editionSlugs },
  });
  const suffix = search ? `?${search}` : "";
  return catalogFetch<SpeciesSummary>(
    `/species/${slug}${suffix}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchSpeciesTraits(slug: string) {
  return catalogFetch<PaginatedResponse<SpeciesTrait>>(
    `/species/${slug}/traits`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchSpeciesTraitChoices(
  slug: string,
  editionSlugs?: string,
) {
  const search = buildCatalogSearchParams({
    page: 1,
    limit: 100,
    filters: { editionSlugs },
  });
  return catalogFetch<PaginatedResponse<SpeciesTraitChoice>>(
    `/species/${slug}/trait-choices?${search}`,
    CATALOG_FETCH_INIT,
  );
}
