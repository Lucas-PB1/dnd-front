import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  FeatListResponse,
  FeatOptionListResponse,
  FeatSummary,
} from "@/entities/feat/types";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const featKeys = {
  all: ["feats"] as const,
  listAll: () => [...featKeys.all, "list", "all"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    category: string;
  }) => [...featKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...featKeys.all, "detail", slug] as const,
  options: (slug: string) => [...featKeys.all, "options", slug] as const,
};

export async function fetchFeatsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}): Promise<FeatListResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? CATALOG_PAGE_SIZE;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  const category = params?.category?.trim();
  if (category) search.set("category", category);

  return catalogFetch<FeatListResponse>(`/feats?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

/** Lista ampla — wizard / ficha (API max 100). */
export async function fetchFeats(limit = 100): Promise<FeatListResponse> {
  return fetchFeatsPage({ page: 1, limit });
}

export async function fetchFeatBySlug(slug: string) {
  return catalogFetch<FeatSummary>(`/feats/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchFeatOptions(slug: string, limit = 50) {
  return catalogFetch<FeatOptionListResponse>(
    `/feats/${encodeURIComponent(slug)}/options?limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
}
