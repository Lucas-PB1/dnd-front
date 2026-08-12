"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAllItems,
  itemKeys,
  type FetchItemsParams,
} from "@/features/catalog/item-catalog/api/items.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

/** Catálogo completo de peças base (sem coberturas) para bundle na loja. */
export function useCoverageBaseItems(
  params: Pick<FetchItemsParams, "itemType"> | undefined,
  enabled = true,
) {
  const itemType = params?.itemType;
  return useQuery({
    queryKey: [...itemKeys.list({ itemType, excludeCoverage: true, allPages: true })],
    queryFn: () =>
      fetchAllItems({
        itemType,
        excludeCoverage: true,
        magic: false,
        hasCost: true,
        limit: 100,
      }),
    enabled: enabled && Boolean(itemType),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
