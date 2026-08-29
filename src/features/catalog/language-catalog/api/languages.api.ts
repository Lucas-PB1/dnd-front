import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  LanguageListResponse,
  LanguageSummary,
} from "@/entities/language/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const FETCH_PAGE_SIZE = 100;

export const languageKeys = {
  all: ["languages"] as const,
  detail: (slug: string) => [...languageKeys.all, "detail", slug] as const,
};

export async function fetchLanguagesPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  rare?: string;
}): Promise<LanguageListResponse> {
  const rare = params?.rare?.trim();
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
    q: params?.q,
    filters: {
      rare: rare === "true" || rare === "false" ? rare : undefined,
    },
  });

  return catalogFetch<LanguageListResponse>(
    `/languages?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllLanguages(params?: { q?: string; rare?: string }) {
  return fetchAllCatalogPages<LanguageListResponse["data"][number]>(
    ({ page, limit, cursor }) =>
      fetchLanguagesPage({ ...params, page, limit, cursor }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchLanguageBySlug(slug: string) {
  return catalogFetch<LanguageSummary>(
    `/languages/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
