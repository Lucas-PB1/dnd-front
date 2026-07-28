import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { SpellListResponse, SpellSummary } from "@/entities/spell/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const spellKeys = {
  all: ["spells"] as const,
  listAll: () => [...spellKeys.all, "list", "all"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    level: string;
    school: string;
  }) => [...spellKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...spellKeys.all, "detail", slug] as const,
};

const FETCH_PAGE_SIZE = 100;

export async function fetchSpellsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  level?: number | string;
  school?: string;
}): Promise<SpellListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: {
      level: params?.level,
      school: params?.school,
    },
  });

  return catalogFetch<SpellListResponse>(
    `/spells?${search}`,
    CATALOG_FETCH_INIT,
  );
}

/** Catálogo completo — wizard, ficha e editores (não usar na listagem paginada). */
export async function fetchSpells(): Promise<SpellListResponse> {
  return fetchAllCatalogPages(
    (page) => fetchSpellsPage({ ...page }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchSpellBySlug(slug: string) {
  return catalogFetch<SpellSummary>(`/spells/${slug}`, CATALOG_FETCH_INIT);
}
