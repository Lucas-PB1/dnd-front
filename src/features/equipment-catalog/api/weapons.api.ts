import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  WeaponListResponse,
  WeaponSummary,
} from "@/entities/weapon/types";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const weaponKeys = {
  all: ["weapons"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    category: string;
  }) => [...weaponKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...weaponKeys.all, "detail", slug] as const,
};

export async function fetchWeaponsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}): Promise<WeaponListResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? CATALOG_PAGE_SIZE;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  const category = params?.category?.trim();
  if (category) search.set("category", category);

  return catalogFetch<WeaponListResponse>(`/weapons?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchWeaponBySlug(slug: string) {
  return catalogFetch<WeaponSummary>(`/weapons/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
}
