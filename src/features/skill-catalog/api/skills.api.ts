import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { SkillListResponse, SkillSummary } from "@/entities/skill/types";
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
  const page = params?.page ?? 1;
  const limit = params?.limit ?? CATALOG_PAGE_SIZE;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  const ability = params?.ability?.trim();
  if (ability) search.set("ability", ability);

  return catalogFetch<SkillListResponse>(`/skills?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

export async function fetchSkillBySlug(slug: string) {
  return catalogFetch<SkillSummary>(`/skills/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
}
