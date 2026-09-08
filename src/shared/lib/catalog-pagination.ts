export const CATALOG_PAGE_SIZE = 20;

export function paginateCatalogItems<T>(
  items: readonly T[],
  page: number,
  paginate: boolean,
  pageSize: number = CATALOG_PAGE_SIZE,
) {
  const size = pageSize > 0 ? pageSize : CATALOG_PAGE_SIZE;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = paginate
    ? items.slice((safePage - 1) * size, safePage * size)
    : items;
  const from = total === 0 ? 0 : (safePage - 1) * size + 1;
  const to = Math.min(safePage * size, total);
  return { pageItems, total, totalPages, safePage, from, to };
}
