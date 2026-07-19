import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { ArmorListResponse, ArmorSummary } from "@/entities/armor/types";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const armorKeys = {
  all: ["armor"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    category: string;
  }) => [...armorKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...armorKeys.all, "detail", slug] as const,
};

export async function fetchArmorPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}): Promise<ArmorListResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? CATALOG_PAGE_SIZE;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  const category = params?.category?.trim();
  if (category) search.set("category", category);

  return catalogFetch<ArmorListResponse>(`/armor?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchArmorBySlug(slug: string) {
  return catalogFetch<ArmorSummary>(`/armor/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
}
