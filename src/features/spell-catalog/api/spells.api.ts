import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import type { SpellListResponse, SpellSummary } from "@/entities/spell/types";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

export const spellKeys = {
  all: ["spells"] as const,
  listAll: () => [...spellKeys.all, "list", "all"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    level: string;
    school: string;
  }) => [...spellKeys.all, "list", "page", params] as const,
  detail: (slug: string) => [...spellKeys.all, "detail", slug] as const,
};

const FETCH_PAGE_SIZE = 100;

export async function fetchSpellsPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  level?: number | string;
  school?: string;
}): Promise<SpellListResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? CATALOG_PAGE_SIZE;
  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("limit", String(limit));
  const q = params?.q?.trim();
  if (q) search.set("q", q);
  if (params?.level !== undefined && params.level !== "") {
    search.set("level", String(params.level));
  }
  const school = params?.school?.trim();
  if (school) search.set("school", school);

  return catalogFetch<SpellListResponse>(`/spells?${search.toString()}`, {
    next: { revalidate: 3600 },
  });
}

/** Catálogo completo — wizard, ficha e editores (não usar na listagem paginada). */
export async function fetchSpells(): Promise<SpellListResponse> {
  const first = await fetchSpellsPage({ page: 1, limit: FETCH_PAGE_SIZE });
  const all: SpellSummary[] = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await fetchSpellsPage({ page, limit: FETCH_PAGE_SIZE });
    all.push(...next.data);
  }
  return {
    data: all,
    meta: {
      page: 1,
      limit: all.length,
      total: first.meta.total,
      totalPages: 1,
    },
  };
}

export async function fetchSpellBySlug(slug: string) {
  return catalogFetch<SpellSummary>(`/spells/${slug}`, {
    next: { revalidate: 3600 },
  });
}
