import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SubclassListResponse,
  SubclassSummary,
} from "@/entities/subclass/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const FETCH_PAGE_SIZE = 100;

export const subclassCatalogKeys = {
  all: ["subclass-catalog"] as const,
  detail: (slug: string) =>
    [...subclassCatalogKeys.all, "detail", slug] as const,
};

export async function fetchSubclassesPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  class?: string;
  editionSlugs?: string;
}): Promise<SubclassListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
    q: params?.q,
    filters: {
      class: params?.class,
      editionSlugs: params?.editionSlugs,
    },
  });

  return catalogFetch<SubclassListResponse>(
    `/subclasses?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllSubclasses(params?: {
  q?: string;
  class?: string;
  editionSlugs?: string;
}) {
  return fetchAllCatalogPages<SubclassListResponse["data"][number]>(
    ({ page, limit, cursor }) =>
      fetchSubclassesPage({ ...params, page, limit, cursor }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchSubclassBySlug(slug: string) {
  return catalogFetch<SubclassSummary>(
    `/subclasses/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
