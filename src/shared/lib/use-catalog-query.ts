"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";

import {
  CATALOG_DETAIL_STALE_MS,
  CATALOG_LIST_STALE_MS,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

type FilterRecord = Record<string, string | undefined>;

function trimFilters<T extends FilterRecord>(filters: T): { [K in keyof T]: string } {
  const out = {} as { [K in keyof T]: string };
  for (const key of Object.keys(filters) as (keyof T)[]) {
    out[key] = filters[key]?.trim() ?? "";
  }
  return out;
}

function emptyToUndefined<T extends Record<string, string>>(
  filters: T,
): { [K in keyof T]?: string } {
  const out = {} as { [K in keyof T]?: string };
  for (const key of Object.keys(filters) as (keyof T)[]) {
    const value = filters[key];
    if (value) out[key] = value;
  }
  return out;
}

type CatalogListQueryArgs<TFilters extends FilterRecord, TData> = {
  page: number;
  filters?: TFilters;
  queryKey: (params: {
    page: number;
    limit: number;
  } & { [K in keyof TFilters]: string }) => QueryKey;
  queryFn: (
    params: { page: number; limit: number } & { [K in keyof TFilters]?: string },
  ) => Promise<TData>;
  /**
   * Se true, não reaproveita placeholder quando algum filtro está ativo
   * (armas/armaduras).
   */
  clearPlaceholderOnFilter?: boolean;
  limit?: number;
};

/** Listagem paginada do compêndio: trim, stale curto e placeholder. */
export function useCatalogListQuery<TFilters extends FilterRecord, TData>({
  page,
  filters,
  queryKey,
  queryFn,
  clearPlaceholderOnFilter = false,
  limit = CATALOG_PAGE_SIZE,
}: CatalogListQueryArgs<TFilters, TData>) {
  const normalized = trimFilters((filters ?? {}) as TFilters);
  const hasFilter = Object.values(normalized).some(Boolean);

  return useQuery({
    queryKey: queryKey({ page, limit, ...normalized }),
    queryFn: () =>
      queryFn({
        page,
        limit,
        ...emptyToUndefined(normalized),
      }),
    staleTime: CATALOG_LIST_STALE_MS,
    placeholderData: (previous) =>
      clearPlaceholderOnFilter && hasFilter ? undefined : previous,
  });
}

type CatalogDetailQueryArgs<TData> = {
  slug: string;
  queryKey: QueryKey;
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
