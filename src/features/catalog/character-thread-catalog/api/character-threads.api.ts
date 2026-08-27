import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CharacterThreadDetail,
  CharacterThreadListResponse,
} from "@/entities/character-thread/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const characterThreadKeys = {
  all: ["character-threads"] as const,
  listAll: () => [...characterThreadKeys.all, "list", "all"] as const,
  detail: (slug: string) =>
    [...characterThreadKeys.all, "detail", slug] as const,
};

export async function fetchCharacterThreadsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: {
      editionSlugs: params?.editionSlugs,
      fields: params?.fields,
    },
  });

  return catalogFetch<CharacterThreadListResponse>(
    `/character-threads?${search}`,
    CATALOG_FETCH_INIT,
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
