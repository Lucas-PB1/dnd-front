import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import type {
  HeritageDetail,
  HeritageModularTrait,
  HeritageSummary,
  HeritageTraitChoice,
  HeritageTraditionalTrait,
} from "@/entities/heritage/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";

const FETCH_PAGE_SIZE = 100;
const TRAIT_CHOICES_PAGE_SIZE = 100;

export const heritageKeys = {
  all: ["heritages"] as const,
  list: () => [...heritageKeys.all, "list"] as const,
  detail: (slug: string, editionSlugs?: string) =>
    [...heritageKeys.all, "detail", slug, editionSlugs ?? "all"] as const,
  traitChoices: (slug: string, editionSlugs?: string) =>
    [...heritageKeys.all, "trait-choices", slug, editionSlugs ?? "all"] as const,
  modularTraits: (slug: string) =>
    [...heritageKeys.all, "modular-traits", slug] as const,
  traditional: (slug: string) =>
    [...heritageKeys.all, "traditional", slug] as const,
};

export async function fetchHeritagesPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
  includeCatalogOnly?: boolean;
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? 50,
    cursor: params?.cursor,
    q: params?.q,
    filters: {
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
      includeCatalogOnly: params?.includeCatalogOnly ? "true" : undefined,
    },
  });

  return catalogFetch<PaginatedResponse<HeritageSummary>>(
    `/heritages?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllHeritages(params?: {
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
  includeCatalogOnly?: boolean;
}) {
  return fetchAllCatalogPages<HeritageSummary>(
    ({ page, limit, cursor }) =>
      fetchHeritagesPage({ ...params, page, limit, cursor }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchHeritageBySlug(slug: string, editionSlugs?: string) {
  const search = buildCatalogSearchParams({
    filters: { editionSlugs },
  });
  const suffix = search ? `?${search}` : "";
  return catalogFetch<HeritageDetail>(
    `/heritages/${slug}${suffix}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchHeritageModularTraits(slug: string) {
  return fetchAllCatalogPages<HeritageModularTrait>(
    ({ page, limit, cursor }) => {
      const search = buildCatalogSearchParams({ page, limit, cursor });
      return catalogFetch<PaginatedResponse<HeritageModularTrait>>(
        `/heritages/${slug}/traits?${search}`,
        CATALOG_FETCH_INIT,
      );
    },
    TRAIT_CHOICES_PAGE_SIZE,
  );
}

export async function fetchHeritageTraitChoices(
  slug: string,
  editionSlugs?: string,
) {
  return fetchAllCatalogPages<HeritageTraitChoice>(
    ({ page, limit, cursor }) => {
      const search = buildCatalogSearchParams({
        page,
        limit,
        cursor,
        filters: { editionSlugs },
      });
      return catalogFetch<PaginatedResponse<HeritageTraitChoice>>(
        `/heritages/${slug}/trait-choices?${search}`,
        CATALOG_FETCH_INIT,
      );
    },
    TRAIT_CHOICES_PAGE_SIZE,
  );
}

export async function fetchHeritageTraditionalBuild(slug: string) {
  try {
    const search = buildCatalogSearchParams({ limit: TRAIT_CHOICES_PAGE_SIZE });
    return await catalogFetch<PaginatedResponse<HeritageTraditionalTrait>>(
      `/heritages/${slug}/traditional-build?${search}`,
      CATALOG_FETCH_INIT,
    );
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) {
      return {
        data: [],
        meta: { page: 1, limit: 0, total: 0, totalPages: 0 },
      };
    }
    throw error;
  }
}
