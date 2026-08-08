import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  FeatCatalogLabelListResponse,
  FeatListResponse,
  FeatOptionListResponse,
  FeatSummary,
} from "@/entities/feat/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const featKeys = {
  all: ["feats"] as const,
  labelsAll: () => [...featKeys.all, "labels", "all"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    category: string;
    editionSlugs?: string;
  }) => [...featKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...featKeys.all, "detail", slug] as const,
  bySlugs: (slugs: string[]) =>
    [...featKeys.all, "by-slugs", [...slugs].sort().join(",")] as const,
  options: (slug: string) => [...featKeys.all, "options", slug] as const,
  optionsBySlugs: (slugs: string[]) =>
    [...featKeys.all, "options-batch", [...slugs].sort().join(",")] as const,
};

const MAX_FEAT_BATCH_SLUGS = 40;

const FETCH_PAGE_SIZE = 100;

export async function fetchFeatsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  editionSlugs?: string;
  fields?: "summary";
}): Promise<FeatListResponse | FeatCatalogLabelListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: {
      category: params?.category,
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<FeatListResponse | FeatCatalogLabelListResponse>(
    `/feats?${search}`,
    CATALOG_FETCH_INIT,
  );
}

/** Só labels (`fields=summary`) — ficha / review / epic-boon set. */
export async function fetchFeatLabels(
  editionSlugs?: string,
): Promise<FeatCatalogLabelListResponse> {
  return fetchAllCatalogPages(
    (page) =>
      fetchFeatsPage({
        ...page,
        editionSlugs,
        fields: "summary",
      }) as Promise<FeatCatalogLabelListResponse>,
    FETCH_PAGE_SIZE,
  );
}

export async function fetchFeatBySlug(slug: string) {
  return catalogFetch<FeatSummary>(
    `/feats/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchFeatsBySlugs(slugs: string[]): Promise<FeatSummary[]> {
  const unique = [...new Set(slugs.filter(Boolean))].slice(
    0,
    MAX_FEAT_BATCH_SLUGS,
  );
  if (unique.length === 0) return [];
  const search = new URLSearchParams();
  search.set("slugs", unique.join(","));
  return catalogFetch<FeatSummary[]>(
    `/feats/by-slugs?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export type FeatOptionsBySlug = {
  featSlug: string;
  options: FeatOptionListResponse["data"];
};

export async function fetchFeatOptions(slug: string, limit = 50) {
  return catalogFetch<FeatOptionListResponse>(
    `/feats/${encodeURIComponent(slug)}/options?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchFeatOptionsBySlugs(
  slugs: string[],
): Promise<FeatOptionsBySlug[]> {
  const unique = [...new Set(slugs.filter(Boolean))].slice(
    0,
    MAX_FEAT_BATCH_SLUGS,
  );
  if (unique.length === 0) return [];
  const search = new URLSearchParams();
  search.set("slugs", unique.join(","));
  return catalogFetch<FeatOptionsBySlug[]>(
    `/feats/options?${search}`,
    CATALOG_FETCH_INIT,
  );
}
