import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  WeaponListResponse,
  WeaponSummary,
} from "@/entities/weapon/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const weaponKeys = {
  all: ["weapons"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    category: string;
  }) => [...weaponKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...weaponKeys.all, "detail", slug] as const,
};

export async function fetchWeaponsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}): Promise<WeaponListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: { category: params?.category },
  });

  return catalogFetch<WeaponListResponse>(
    `/weapons?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchWeaponBySlug(slug: string) {
  return catalogFetch<WeaponSummary>(
    `/weapons/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
