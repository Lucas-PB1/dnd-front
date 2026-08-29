import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { SkillListResponse, SkillSummary } from "@/entities/skill/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
  fetchAllCatalogPages,
} from "@/shared/lib/catalog-query";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const FETCH_PAGE_SIZE = 100;

export const skillKeys = {
  all: ["skills"] as const,
  detail: (slug: string) => [...skillKeys.all, "detail", slug] as const,
};

export async function fetchSkillsPage(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  ability?: string;
}): Promise<SkillListResponse> {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? CATALOG_PAGE_SIZE,
    cursor: params?.cursor,
    q: params?.q,
    filters: { ability: params?.ability },
  });

  return catalogFetch<SkillListResponse>(
    `/skills?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchAllSkills(params?: { q?: string; ability?: string }) {
  return fetchAllCatalogPages<SkillListResponse["data"][number]>(
    ({ page, limit, cursor }) =>
      fetchSkillsPage({ ...params, page, limit, cursor }),
    FETCH_PAGE_SIZE,
  );
}

export async function fetchSkillBySlug(slug: string) {
  return catalogFetch<SkillSummary>(
    `/skills/${encodeURIComponent(slug)}`,
    CATALOG_FETCH_INIT,
  );
}
