import type { PaginatedResponse } from "@/shared/api/dnd-api/types";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

/** staleTime das listagens paginadas do compêndio (com placeholder). */
export const CATALOG_LIST_STALE_MS = 60 * 1000;

/** staleTime de detalhe / listagens completas (wizard, ficha). */
export const CATALOG_DETAIL_STALE_MS = 60 * 60 * 1000;

/** Revalidate do Next cache em `catalogFetch`. */
export const CATALOG_REVALIDATE_SECONDS = 3600;

export const CATALOG_FETCH_INIT = {
  next: { revalidate: CATALOG_REVALIDATE_SECONDS },
} as const;

export type CatalogSearchParamsInput = {
  page?: number;
  limit?: number;
  cursor?: string;
  q?: string;
  /** Filtros opcionais; strings vazias / null / undefined são omitidos. */
  filters?: Record<string, string | number | boolean | null | undefined>;
};

/** Monta `page`/`limit`/`q` + filtros para endpoints paginados do catálogo. */
export function buildCatalogSearchParams(
  input: CatalogSearchParamsInput = {},
): URLSearchParams {
  const search = new URLSearchParams();
  if (input.cursor) {
    search.set("cursor", input.cursor);
  } else {
    search.set("page", String(input.page ?? 1));
  }
  search.set("limit", String(input.limit ?? CATALOG_PAGE_SIZE));

  const q = input.q?.trim();
  if (q) search.set("q", q);

  if (input.filters) {
    for (const [key, value] of Object.entries(input.filters)) {
      if (value === undefined || value === null || value === "") continue;
      const raw = typeof value === "string" ? value.trim() : String(value);
      if (raw) search.set(key, raw);
    }
  }

  return search;
}

/** Percorre todas as páginas de um endpoint com paginação por cursor (`meta.hasMore`). */
export async function fetchAllCatalogCursorPages<T>(
  fetchPage: (params: {
    page: number;
    limit: number;
    cursor?: string;
  }) => Promise<PaginatedResponse<T>>,
  limit = 100,
): Promise<PaginatedResponse<T>> {
  const first = await fetchPage({ page: 1, limit });
  const totalPages = first.meta.totalPages;

  if (typeof totalPages === "number" && totalPages > 0) {
    const pages =
      totalPages <= 1
        ? []
        : await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              fetchPage({ page: index + 2, limit }),
            ),
          );

    const all = [...first.data, ...pages.flatMap((page) => page.data)];
    return {
      data: all,
      meta: {
        page: 1,
        limit: all.length,
        total: first.meta.total ?? all.length,
        totalPages: 1,
      },
    };
  }

  // Se a paginação for por cursor (ex.: backend Nest com cursor e hasMore)
  const all: T[] = [...first.data];
  let currentMeta = first.meta;

  while (currentMeta.hasMore && currentMeta.nextCursor) {
    const next = await fetchPage({
      page: 1,
      limit,
      cursor: currentMeta.nextCursor,
    });
    all.push(...next.data);
    currentMeta = next.meta;
  }

  return {
    data: all,
    meta: {
      page: 1,
      limit: all.length,
      total: all.length,
      totalPages: 1,
    },
  };
}

/** Concatena páginas (cursor ou `totalPages`, conforme a resposta da API). */
export async function fetchAllCatalogPages<T>(
  fetchPage: (params: {
    page: number;
    limit: number;
    cursor?: string;
  }) => Promise<PaginatedResponse<T>>,
  limit = 100,
): Promise<PaginatedResponse<T>> {
  return fetchAllCatalogCursorPages(fetchPage, limit);
}
