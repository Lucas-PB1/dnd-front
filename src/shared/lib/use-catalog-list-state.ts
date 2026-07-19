"use client";

import { useState } from "react";

import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";

type CatalogMeta = {
  total?: number;
  totalPages?: number;
};

/** Estado de busca + página para listagens paginadas do catálogo. */
export function useCatalogListState() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [page, setPage] = useState(1);
  const [pageQuery, setPageQuery] = useState(debouncedQuery);

  if (pageQuery !== debouncedQuery) {
    setPageQuery(debouncedQuery);
    setPage(1);
  }

  function pageWindow(meta?: CatalogMeta) {
    const total = meta?.total ?? 0;
    const totalPages = Math.max(1, meta?.totalPages ?? 1);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const from = total === 0 ? 0 : (safePage - 1) * CATALOG_PAGE_SIZE + 1;
    const to = Math.min(safePage * CATALOG_PAGE_SIZE, total);
    return { total, totalPages, safePage, from, to };
  }

  return {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    pageWindow,
  };
}
