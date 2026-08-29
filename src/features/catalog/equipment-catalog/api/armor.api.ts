import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { ArmorListResponse, ArmorSummary } from "@/entities/armor/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const armorKeys = {
  all: ["armor"] as const,
  detail: (slug: string) => [...armorKeys.all, "detail", slug] as const,
};

export async function fetchArmorPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  category?: string;
}): Promise<ArmorListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
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

/** Todas as armaduras do catálogo (lookup rápido na loja). */
export async function fetchAllArmor(params?: { q?: string; category?: string }) {
  return fetchAllCatalogPages<ArmorSummary>(({ page, limit, cursor }) =>
    fetchArmorPage({ ...params, page, limit, cursor }),
  );
}
