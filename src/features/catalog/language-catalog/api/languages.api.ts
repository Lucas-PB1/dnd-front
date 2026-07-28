import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  LanguageListResponse,
  LanguageSummary,
} from "@/entities/language/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const languageKeys = {
  all: ["languages"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    rare: string;
  }) => [...languageKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...languageKeys.all, "detail", slug] as const,
};

export async function fetchLanguagesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  rare?: string;
}): Promise<LanguageListResponse> {
  const rare = params?.rare?.trim();
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
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

export async function fetchLanguageBySlug(slug: string) {
  return catalogFetch<LanguageSummary>(
    `/languages/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
