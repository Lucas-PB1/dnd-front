import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { ItemListResponse, ItemSummary } from "@/entities/item/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";

export const itemKeys = {
  all: ["items"] as const,
  list: (params?: {
    q?: string;
    itemType?: string;
    limit?: number;
    page?: number;
  }) => [...itemKeys.all, "list", params ?? {}] as const,
  detail: (slug: string) => [...itemKeys.all, "detail", slug] as const,
};

export async function fetchItems(params?: {
  q?: string;
  itemType?: string;
  limit?: number;
  page?: number;
}) {
  const search = buildCatalogSearchParams({
    page: params?.page ?? 1,
    limit: params?.limit ?? 100,
    q: params?.q,
    filters: { itemType: params?.itemType },
  });

  return catalogFetch<ItemListResponse>(`/items?${search}`, CATALOG_FETCH_INIT);
}

export async function fetchItemBySlug(slug: string) {
  return catalogFetch<ItemSummary>(`/items/${slug}`, CATALOG_FETCH_INIT);
}
