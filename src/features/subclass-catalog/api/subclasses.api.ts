import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  SubclassListResponse,
  SubclassSummary,
} from "@/entities/subclass/types";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const subclassCatalogKeys = {
  all: ["subclass-catalog"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    class: string;
  }) => [...subclassCatalogKeys.all, "list", "page", params] as const,
  detail: (slug: string) =>
    [...subclassCatalogKeys.all, "detail", slug] as const,
};

export async function fetchSubclassesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  class?: string;
}): Promise<SubclassListResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? CATALOG_PAGE_SIZE;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  const classSlug = params?.class?.trim();
  if (classSlug) search.set("class", classSlug);

  return catalogFetch<SubclassListResponse>(
    `/subclasses?${search.toString()}`,
    { next: { revalidate: 3600 } },
  );
}

export async function fetchSubclassBySlug(slug: string) {
  return catalogFetch<SubclassSummary>(
    `/subclasses/${encodeURIComponent(slug)}`,
    { next: { revalidate: 3600 } },
  );
}
