"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchItems, itemKeys } from "@/features/item-catalog/api/items.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

export function useItems(
  params?: { q?: string; itemType?: string; limit?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => fetchItems(params),
    enabled,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
