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
  ritual?: boolean | string;
  concentration?: boolean | string;
  roll?: string;
  castingTime?: string;
  saveAbility?: string;
  rangeKind?: string;
  sangromancy?: boolean;
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
      ritual:
        params?.ritual === undefined || params?.ritual === ""
          ? undefined
          : String(params.ritual),
      concentration:
        params?.concentration === undefined || params?.concentration === ""
          ? undefined
          : String(params.concentration),
      roll: params?.roll || undefined,
      castingTime: params?.castingTime || undefined,
      saveAbility: params?.saveAbility || undefined,
      rangeKind: params?.rangeKind || undefined,
      sangromancy: params?.sangromancy ? "true" : undefined,
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<SpellListResponse | SpellCatalogLabelListResponse>(
    `/spells?${search}`,
    CATALOG_FETCH_INIT,
  );
}

/** Compêndio — todas as magias (summary) com filtros opcionais. */
export async function fetchAllSpellsSummary(params?: {
  q?: string;
  level?: number | string;
  school?: string;
  ritual?: string;
  concentration?: string;
  roll?: string;
  castingTime?: string;
  saveAbility?: string;
  rangeKind?: string;
  editionSlugs?: string;
}): Promise<SpellListResponse> {
  return fetchAllCatalogPages(
    (page) =>
      fetchSpellsPage({
        ...page,
        ...params,
        fields: "summary",
      }) as Promise<SpellListResponse>,
    FETCH_PAGE_SIZE,
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

export async function fetchSangromancySpells(maxLevel?: number) {
  const response = await fetchAllCatalogPages<SpellSummary>(
    (page) =>
      fetchSpellsPage({
        ...page,
        sangromancy: true,
        fields: "summary",
      }) as Promise<SpellListResponse>,
    FETCH_PAGE_SIZE,
  );
  if (maxLevel == null) return response;
  return {
    ...response,
    data: response.data.filter(
      (spell) => spell.level >= 1 && spell.level <= maxLevel,
    ),
  };
}
