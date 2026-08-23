import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SpellCatalogLabelListResponse,
  SpellListResponse,
  SpellSummary,
} from "@/entities/spell/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const spellKeys = {
  all: ["spells"] as const,
  listAll: () => [...spellKeys.all, "list", "all"] as const,
  labelsAll: () => [...spellKeys.all, "labels", "all"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    level: string;
    school: string;
    editionSlugs?: string;
  }) => [...spellKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...spellKeys.all, "detail", slug] as const,
};

const FETCH_PAGE_SIZE = 100;

export async function fetchSpellsPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  level?: number | string;
  school?: string;
  editionSlugs?: string;
  fields?: "summary";
}): Promise<SpellListResponse | SpellCatalogLabelListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
    q: params?.q,
    filters: {
      level: params?.level,
      school: params?.school,
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<SpellListResponse | SpellCatalogLabelListResponse>(
    `/spells?${search}`,
    CATALOG_FETCH_INIT,
  );
}

/** Catálogo completo — wizard / editores (não usar na listagem paginada). */
export async function fetchSpells(
  editionSlugs?: string,
): Promise<SpellListResponse> {
  return fetchAllCatalogPages(
    (page) =>
      fetchSpellsPage({ ...page, editionSlugs }) as Promise<SpellListResponse>,
    FETCH_PAGE_SIZE,
  );
}

/** Só labels (`fields=summary`) — ficha / review. */
export async function fetchSpellLabels(
  editionSlugs?: string,
): Promise<SpellCatalogLabelListResponse> {
  return fetchAllCatalogPages(
    (page) =>
      fetchSpellsPage({
        ...page,
        editionSlugs,
        fields: "summary",
      }) as Promise<SpellCatalogLabelListResponse>,
    FETCH_PAGE_SIZE,
  );
}

export async function fetchSpellBySlug(slug: string) {
  return catalogFetch<SpellSummary>(`/spells/${slug}`, CATALOG_FETCH_INIT);
}
