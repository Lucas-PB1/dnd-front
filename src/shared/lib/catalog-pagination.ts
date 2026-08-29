export const CATALOG_PAGE_SIZE = 20;

export function paginateCatalogItems<T>(
  items: readonly T[],
  page: number,
  paginate: boolean,
) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = paginate
    ? items.slice(
        (safePage - 1) * CATALOG_PAGE_SIZE,
        safePage * CATALOG_PAGE_SIZE,
      )
    : items;
  const from = total === 0 ? 0 : (safePage - 1) * CATALOG_PAGE_SIZE + 1;
  const to = Math.min(safePage * CATALOG_PAGE_SIZE, total);
  return { pageItems, total, totalPages, safePage, from, to };
}
