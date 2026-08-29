import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  FightingStyleListResponse,
  FightingStyleSummary,
} from "@/entities/fighting-style/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const FETCH_PAGE_SIZE = 100;

export const fightingStyleKeys = {
  all: ["fighting-styles"] as const,
  detail: (slug: string) => [...fightingStyleKeys.all, "detail", slug] as const,
};

export async function fetchFightingStylesPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  classSlug?: string;
}): Promise<FightingStyleListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
    q: params?.q,
    filters: { class: params?.classSlug },
  });

  return catalogFetch<FightingStyleListResponse>(
    `/fighting-styles?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllFightingStyles(params?: {
  q?: string;
  class?: string;
}) {
  return fetchAllCatalogPages<FightingStyleListResponse["data"][number]>(
    ({ page, limit, cursor }) =>
      fetchFightingStylesPage({
        ...params,
        classSlug: params?.class,
        page,
        limit,
        cursor,
      }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchFightingStyleBySlug(slug: string) {
  return catalogFetch<FightingStyleSummary>(
    `/fighting-styles/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
