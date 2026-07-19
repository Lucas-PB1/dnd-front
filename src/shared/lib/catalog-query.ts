import type { PaginatedMeta, PaginatedResponse } from "@/shared/api/dnd-api/types";
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
  q?: string;
  /** Filtros opcionais; strings vazias / null / undefined são omitidos. */
  filters?: Record<string, string | number | boolean | null | undefined>;
};

/** Monta `page`/`limit`/`q` + filtros para endpoints paginados do catálogo. */
export function buildCatalogSearchParams(
  input: CatalogSearchParamsInput = {},
): URLSearchParams {
  const search = new URLSearchParams();
  search.set("page", String(input.page ?? 1));
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

/** Página pedida sem itens enquanto o total ainda existe (URL stale). */
export function isCatalogPageOutOfRange(
  data: { data: unknown[]; meta?: Pick<PaginatedMeta, "total"> } | undefined,
  page: number,
  totalPages: number,
): boolean {
  return !data?.data.length && (data?.meta?.total ?? 0) > 0 && page > totalPages;
}

/** Concatena todas as páginas de um endpoint paginado. */
export async function fetchAllCatalogPages<T>(
  fetchPage: (params: {
    page: number;
    limit: number;
  }) => Promise<PaginatedResponse<T>>,
  limit = 100,
): Promise<PaginatedResponse<T>> {
  const first = await fetchPage({ page: 1, limit });
  const pages =
    first.meta.totalPages <= 1
      ? []
      : await Promise.all(
          Array.from({ length: first.meta.totalPages - 1 }, (_, index) =>
            fetchPage({ page: index + 2, limit }),
          ),
        );

  const all = [...first.data, ...pages.flatMap((page) => page.data)];
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
