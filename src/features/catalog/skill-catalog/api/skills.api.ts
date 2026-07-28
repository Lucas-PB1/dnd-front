import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { SkillListResponse, SkillSummary } from "@/entities/skill/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const skillKeys = {
  all: ["skills"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    ability: string;
  }) => [...skillKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...skillKeys.all, "detail", slug] as const,
};

export async function fetchSkillsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  ability?: string;
}): Promise<SkillListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    q: params?.q,
    filters: { ability: params?.ability },
  });

  return catalogFetch<SkillListResponse>(
    `/skills?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchSkillBySlug(slug: string) {
  return catalogFetch<SkillSummary>(
    `/skills/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
