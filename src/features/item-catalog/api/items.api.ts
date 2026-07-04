import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { ItemListResponse, ItemSummary } from "@/entities/item/types";

export const itemKeys = {
  all: ["items"] as const,
  list: (params?: { q?: string; itemType?: string; limit?: number }) =>
    [...itemKeys.all, "list", params ?? {}] as const,
  detail: (slug: string) => [...itemKeys.all, "detail", slug] as const,
};

export async function fetchItems(params?: {
  q?: string;
  itemType?: string;
  limit?: number;
  page?: number;
}) {
  const search = new URLSearchParams();
  search.set("limit", String(params?.limit ?? 100));
  search.set("page", String(params?.page ?? 1));
  if (params?.q?.trim()) search.set("q", params.q.trim());
  if (params?.itemType?.trim()) search.set("itemType", params.itemType.trim());

  return catalogFetch<ItemListResponse>(`/items?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchItemBySlug(slug: string) {
  return catalogFetch<ItemSummary>(`/items/${slug}`, {
    next: { revalidate: 3600 },
  });
}
