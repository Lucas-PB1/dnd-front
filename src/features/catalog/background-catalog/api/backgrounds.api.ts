import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  BackgroundEquipmentOption,
  BackgroundLanguageOption,
  BackgroundListResponse,
  BackgroundSkillOption,
  BackgroundSummary,
  BackgroundToolOption,
} from "@/entities/background/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const backgroundKeys = {
  all: ["backgrounds"] as const,
  listAll: () => [...backgroundKeys.all, "list", "all"] as const,
  detail: (slug: string) => [...backgroundKeys.all, "detail", slug] as const,
  equipment: (slug: string) =>
    [...backgroundKeys.all, "equipment", slug] as const,
  skills: (slug: string) => [...backgroundKeys.all, "skills", slug] as const,
  tools: (slug: string) => [...backgroundKeys.all, "tools", slug] as const,
  languages: (slug: string) =>
    [...backgroundKeys.all, "languages", slug] as const,
};

export async function fetchBackgroundsPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
    q: params?.q,
    filters: {
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<BackgroundListResponse>(
    `/backgrounds?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllBackgrounds(params?: {
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  return fetchAllCatalogPages<BackgroundListResponse["data"][number]>(
    ({ page, limit, cursor }) =>
      fetchBackgroundsPage({ ...params, page, limit, cursor }),
    100,
  );
}

/** Lista completa — wizard / ficha. */
export async function fetchBackgrounds(
  _limit = 50,
  editionSlugs?: string,
  fields?: "summary",
) {
  return fetchAllBackgrounds({ editionSlugs, fields });
}

export async function fetchBackgroundBySlug(slug: string) {
  return catalogFetch<BackgroundSummary>(
    `/backgrounds/${slug}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchBackgroundEquipment(slug: string) {
  return fetchAllCatalogPages<BackgroundEquipmentOption>(({ page, limit, cursor }) => {
    const search = buildCatalogSearchParams({ page, limit, cursor });
    return catalogFetch<PaginatedResponse<BackgroundEquipmentOption>>(
      `/backgrounds/${slug}/equipment?${search}`,
      CATALOG_FETCH_INIT,
    );
  });
}

export async function fetchBackgroundSkills(slug: string) {
  return catalogFetch<PaginatedResponse<BackgroundSkillOption>>(
    `/backgrounds/${slug}/skills`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchBackgroundTools(slug: string, limit = 50) {
  return catalogFetch<PaginatedResponse<BackgroundToolOption>>(
    `/backgrounds/${slug}/tools?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchBackgroundLanguages(slug: string) {
  return catalogFetch<PaginatedResponse<BackgroundLanguageOption>>(
    `/backgrounds/${slug}/languages`,
    CATALOG_FETCH_INIT,
  );
}
