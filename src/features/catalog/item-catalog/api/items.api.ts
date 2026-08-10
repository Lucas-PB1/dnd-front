import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { ItemListResponse, ItemSummary } from "@/entities/item/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";

export async function fetchItems(params?: {
  q?: string;
  itemType?: string;
  magic?: boolean;
  rarity?: string;
  editionSlugs?: string;
  limit?: number;
  page?: number;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page ?? 1,
    limit: params?.limit ?? 100,
    q: params?.q,
    filters: {
      itemType: params?.itemType,
      magic:
        params?.magic === undefined
          ? undefined
          : params.magic
            ? "true"
            : "false",
      rarity: params?.rarity,
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<ItemListResponse>(`/items?${search}`, CATALOG_FETCH_INIT);
}

export const itemKeys = {
  all: ["items"] as const,
  list: (params?: {
    q?: string;
    itemType?: string;
    magic?: boolean;
    rarity?: string;
    editionSlugs?: string;
    limit?: number;
    page?: number;
  }) => [...itemKeys.all, "list", params ?? {}] as const,
  detail: (slug: string) => [...itemKeys.all, "detail", slug] as const,
};

export async function fetchItemBySlug(slug: string) {
  return catalogFetch<ItemSummary>(`/items/${slug}`, CATALOG_FETCH_INIT);
}
