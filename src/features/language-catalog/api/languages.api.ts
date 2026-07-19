import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  LanguageListResponse,
  LanguageSummary,
} from "@/entities/language/types";
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
  const page = params?.page ?? 1;
  const limit = params?.limit ?? CATALOG_PAGE_SIZE;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  const rare = params?.rare?.trim();
  if (rare === "true" || rare === "false") search.set("rare", rare);

  return catalogFetch<LanguageListResponse>(`/languages?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchLanguageBySlug(slug: string) {
  return catalogFetch<LanguageSummary>(
    `/languages/${encodeURIComponent(slug)}`,
    { next: { revalidate: 3600 } },
  );
}
