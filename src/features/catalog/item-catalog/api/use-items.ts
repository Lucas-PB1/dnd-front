"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchItems,
  fetchPopularItems,
  itemKeys,
  type FetchItemsParams,
} from "@/features/catalog/item-catalog/api/items.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

export function useItems(params?: FetchItemsParams, enabled = true) {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => fetchItems(params),
    enabled,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function usePopularItems(
  metric: "purchase" | "view" = "purchase",
  limit = 6,
  enabled = true,
) {
  return useQuery({
    queryKey: itemKeys.popular(metric),
    queryFn: () => fetchPopularItems({ metric, limit }),
    enabled,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
