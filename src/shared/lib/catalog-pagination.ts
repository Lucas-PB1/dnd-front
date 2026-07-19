export const CATALOG_PAGE_SIZE = 20;

export type CatalogPageSlice<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
};

/** Fatia uma lista já filtrada em páginas de `pageSize`. */
export function sliceCatalogPage<T>(
  items: T[],
  page: number,
  pageSize: number = CATALOG_PAGE_SIZE,
): CatalogPageSlice<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return {
    items: slice,
    page: safePage,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
  };
}
