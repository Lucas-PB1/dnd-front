"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchItems, itemKeys } from "@/features/item-catalog/api/items.api";

const STALE = 60 * 60 * 1000;

export function useItems(
  params?: { q?: string; itemType?: string; limit?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => fetchItems(params),
    enabled,
    staleTime: STALE,
  });
}
