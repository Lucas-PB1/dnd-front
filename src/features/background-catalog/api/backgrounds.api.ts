import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type {
  BackgroundEquipmentOption,
  BackgroundListResponse,
  BackgroundSkillOption,
  BackgroundSummary,
  BackgroundToolOption,
} from "@/entities/background/types";
import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const backgroundKeys = {
  all: ["backgrounds"] as const,
  listAll: () => [...backgroundKeys.all, "list", "all"] as const,
  listPage: (params: { page: number; limit: number; q: string }) =>
    [...backgroundKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...backgroundKeys.all, "detail", slug] as const,
  equipment: (slug: string) =>
    [...backgroundKeys.all, "equipment", slug] as const,
  skills: (slug: string) => [...backgroundKeys.all, "skills", slug] as const,
  tools: (slug: string) => [...backgroundKeys.all, "tools", slug] as const,
};

export async function fetchBackgroundsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
  });

  return catalogFetch<BackgroundListResponse>(
    `/backgrounds?${search}`,
    CATALOG_FETCH_INIT,
  );
}

/** Lista completa (poucos itens) — wizard / ficha. */
export async function fetchBackgrounds(limit = 50) {
  return fetchBackgroundsPage({ page: 1, limit });
}

export async function fetchBackgroundBySlug(slug: string) {
  return catalogFetch<BackgroundSummary>(
    `/backgrounds/${slug}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchBackgroundEquipment(slug: string) {
  return catalogFetch<PaginatedResponse<BackgroundEquipmentOption>>(
    `/backgrounds/${slug}/equipment`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchBackgroundSkills(slug: string) {
  return catalogFetch<PaginatedResponse<BackgroundSkillOption>>(
    `/backgrounds/${slug}/skills`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchBackgroundTools(slug: string, limit = 50) {
  return catalogFetch<PaginatedResponse<BackgroundToolOption>>(
    `/backgrounds/${slug}/tools?limit=${limit}`,
    CATALOG_FETCH_INIT,
  );
}
