"use client";

import { useMemo, useState } from "react";

type UseClientPaginatedSearchOptions<T> = {
  items: readonly T[];
  /** Texto usado na busca (nome, descrição, etc.). */
  getSearchText: (item: T) => string;
  pageSize?: number;
};

export function useClientPaginatedSearch<T>({
  items,
  getSearchText,
  pageSize = 12,
}: UseClientPaginatedSearchOptions<T>) {
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(1);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return [...items];
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(normalizedQuery),
    );
  }, [items, normalizedQuery, getSearchText]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const fromIndex = (safePage - 1) * pageSize;
  const toIndex = Math.min(fromIndex + pageSize, total);
  const pagedItems = filtered.slice(fromIndex, toIndex);

  function setQuery(value: string) {
    setQueryState(value);
    setPage(1);
  }

  return {
    query,
    setQuery,
    filtered,
    pagedItems,
    page: safePage,
    setPage,
    totalPages,
    total,
    from: total === 0 ? 0 : fromIndex + 1,
    to: toIndex,
  };
}
