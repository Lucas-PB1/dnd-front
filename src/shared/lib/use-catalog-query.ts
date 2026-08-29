"use client";

import { useQuery } from "@tanstack/react-query";

import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

type CatalogDetailQueryArgs<TData> = {
  slug: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean | number;
};

/** Detalhe / nested por slug. */
export function useCatalogDetailQuery<TData>({
  slug,
  queryKey,
  queryFn,
  enabled = true,
  staleTime = CATALOG_DETAIL_STALE_MS,
  retry,
}: CatalogDetailQueryArgs<TData>) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !!slug,
    staleTime,
    retry,
  });
}
