import { catalogFetch, gameFetch } from "@/shared/api/dnd-api/api-client";
import type { ItemListResponse, ItemSummary } from "@/entities/item/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";

export type FetchItemsParams = {
  q?: string;
  itemType?: string;
  magic?: boolean;
  rarity?: string;
  editionSlugs?: string;
  hasCost?: boolean;
  kind?: string;
  consumable?: boolean;
  limit?: number;
  page?: number;
  cursor?: string;
  fields?: "summary";
  excludeCoverage?: boolean;
  requiresAttunement?: boolean;
  sort?: "name" | "name_desc" | "cost_asc" | "cost_desc";
};

export async function fetchItems(params?: FetchItemsParams) {
  const search = buildCatalogSearchParams({
    page: params?.page ?? 1,
    limit: params?.limit ?? 100,
    cursor: params?.cursor,
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
      hasCost:
        params?.hasCost === undefined
          ? undefined
          : params.hasCost
            ? "true"
            : "false",
      kind: params?.kind,
      consumable:
        params?.consumable === undefined
          ? undefined
          : params.consumable
            ? "true"
            : "false",
      excludeCoverage:
        params?.excludeCoverage === undefined
          ? undefined
          : params.excludeCoverage
            ? "true"
            : "false",
      requiresAttunement:
        params?.requiresAttunement === undefined
          ? undefined
          : params.requiresAttunement
            ? "true"
            : "false",
      sort: params?.sort,
    },
  });

  return catalogFetch<ItemListResponse>(`/items?${search}`, CATALOG_FETCH_INIT);
}

export async function fetchAllItems(params?: Omit<FetchItemsParams, "page" | "cursor">) {
  const limit = params?.limit ?? 100;
  return fetchAllCatalogPages(
    ({ page, limit: pageLimit, cursor }) =>
      fetchItems({ ...params, page, limit: pageLimit, cursor }),
    limit,
  );
}

export async function fetchPopularItems(params?: {
  metric?: "purchase" | "view";
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.metric) search.set("metric", params.metric);
  if (params?.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();
  return catalogFetch<ItemSummary[]>(
    `/items/popular${qs ? `?${qs}` : ""}`,
    CATALOG_FETCH_INIT,
  );
}

export async function recordItemView(accessToken: string, slug: string) {
  return gameFetch<void>(`/items/${slug}/view`, accessToken, {
    method: "POST",
  });
}

export const itemKeys = {
  all: ["items"] as const,
  list: (params?: FetchItemsParams) =>
    [...itemKeys.all, "list", params ?? {}] as const,
  popular: (metric?: string) =>
    [...itemKeys.all, "popular", metric ?? "purchase"] as const,
  detail: (slug: string) => [...itemKeys.all, "detail", slug] as const,
};

export async function fetchItemBySlug(slug: string) {
  return catalogFetch<ItemSummary>(`/items/${slug}`, CATALOG_FETCH_INIT);
}
