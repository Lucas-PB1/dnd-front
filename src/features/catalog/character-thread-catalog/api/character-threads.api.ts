import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import type {
  CharacterThreadDetail,
  CharacterThreadSummary,
} from "@/entities/character-thread/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const FETCH_PAGE_SIZE = 100;

export const characterThreadKeys = {
  all: ["character-threads"] as const,
  listAll: () => [...characterThreadKeys.all, "list", "all"] as const,
  detail: (slug: string) =>
    [...characterThreadKeys.all, "detail", slug] as const,
};

export async function fetchCharacterThreadsPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
    q: params?.q,
    filters: {
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<PaginatedResponse<CharacterThreadSummary>>(
    `/character-threads?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllCharacterThreads(params?: {
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  return fetchAllCatalogPages<CharacterThreadSummary>(
    ({ page, limit, cursor }) =>
      fetchCharacterThreadsPage({ ...params, page, limit, cursor }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchCharacterThreads(limit = 50) {
  return fetchCharacterThreadsPage({ page: 1, limit, fields: "summary" });
}

export async function fetchCharacterThreadBySlug(slug: string) {
  return catalogFetch<CharacterThreadDetail>(
    `/character-threads/${slug}`,
    CATALOG_FETCH_INIT,
  );
}
