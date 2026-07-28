import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SubclassListResponse,
  SubclassSummary,
} from "@/entities/subclass/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const subclassCatalogKeys = {
  all: ["subclass-catalog"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    class: string;
  }) => [...subclassCatalogKeys.all, "list", "page", params] as const,
  detail: (slug: string) =>
    [...subclassCatalogKeys.all, "detail", slug] as const,
};

export async function fetchSubclassesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  class?: string;
}): Promise<SubclassListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: { class: params?.class },
  });

  return catalogFetch<SubclassListResponse>(
    `/subclasses?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchSubclassBySlug(slug: string) {
  return catalogFetch<SubclassSummary>(
    `/subclasses/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
