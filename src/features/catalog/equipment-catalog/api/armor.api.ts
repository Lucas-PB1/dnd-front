import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { ArmorListResponse, ArmorSummary } from "@/entities/armor/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const armorKeys = {
  all: ["armor"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    category: string;
  }) => [...armorKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...armorKeys.all, "detail", slug] as const,
};

export async function fetchArmorPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}): Promise<ArmorListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: { category: params?.category },
  });

  return catalogFetch<ArmorListResponse>(`/armor?${search}`, CATALOG_FETCH_INIT);
}

export async function fetchArmorBySlug(slug: string) {
  return catalogFetch<ArmorSummary>(
    `/armor/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
