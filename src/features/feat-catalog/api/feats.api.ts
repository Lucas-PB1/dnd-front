import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  FeatListResponse,
  FeatOptionListResponse,
  FeatSummary,
} from "@/entities/feat/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const featKeys = {
  all: ["feats"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    category: string;
  }) => [...featKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...featKeys.all, "detail", slug] as const,
  options: (slug: string) => [...featKeys.all, "options", slug] as const,
};

export async function fetchFeatsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}): Promise<FeatListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: { category: params?.category },
  });

  return catalogFetch<FeatListResponse>(`/feats?${search}`, CATALOG_FETCH_INIT);
}

export async function fetchFeatBySlug(slug: string) {
  return catalogFetch<FeatSummary>(
    `/feats/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchFeatOptions(slug: string, limit = 50) {
  return catalogFetch<FeatOptionListResponse>(
    `/feats/${encodeURIComponent(slug)}/options?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}
