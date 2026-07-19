"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";

type CatalogMeta = {
  total?: number;
  totalPages?: number;
};

type UseCatalogListStateOptions = {
  /** Persiste `q`, `page` e filtros na URL (mantém listagem ao voltar do detalhe). */
  syncUrl?: boolean;
  /** Chaves de filtro estruturado sincronizadas na URL (ex.: level, school). */
  filterKeys?: readonly string[];
};

function readFilters(
  searchParams: Pick<URLSearchParams, "get">,
  filterKeys: readonly string[],
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = searchParams.get(key)?.trim() ?? "";
    if (value) next[key] = value;
  }
  return next;
}

function filtersEqual(a: Record<string, string>, b: Record<string, string>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] ?? "") !== (b[key] ?? "")) return false;
  }
  return true;
}

/** Estado de busca + página + filtros para listagens paginadas do catálogo. */
export function useCatalogListState(options?: UseCatalogListStateOptions) {
  const syncUrl = options?.syncUrl ?? false;
  const filterKeysKey = options?.filterKeys?.join("\0") ?? "";
  const filterKeys = useMemo(
    () => (filterKeysKey ? filterKeysKey.split("\0") : []),
    [filterKeysKey],
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const urlFilters = useMemo(
    () => readFilters(searchParams, filterKeys),
    [searchParams, filterKeys],
  );

  const [query, setQuery] = useState(syncUrl ? urlQuery : "");
  const debouncedQuery = useDebouncedValue(query, 300);

  const [localPage, setLocalPage] = useState(1);
  const [pageQuery, setPageQuery] = useState(debouncedQuery);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);

  // Hidrata o input quando a URL muda (voltar/avançar / troca de aba).
  if (syncUrl && urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  if (!syncUrl && pageQuery !== debouncedQuery) {
    setPageQuery(debouncedQuery);
    setLocalPage(1);
  }

  const filters = syncUrl ? urlFilters : localFilters;

  // Com syncUrl, a página vem só da URL — evita corrida que regrava `page`
  // ao trocar de aba (ex.: itens p.3 → armaduras vazias).
  useEffect(() => {
    if (!syncUrl) return;

    // Debounce atrasado após hidratar da URL: não reescreve o `q` antigo.
    if (query === urlQuery && debouncedQuery !== urlQuery) return;

    const trimmed = debouncedQuery.trim();
    const currentQ = searchParams.get("q") ?? "";
    if (trimmed === currentQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    params.delete("page");

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [
    syncUrl,
    query,
    debouncedQuery,
    urlQuery,
    pathname,
    router,
    searchParams,
  ]);

  const setPage = useCallback(
    (next: number) => {
      const safe = Math.max(1, next);
      if (!syncUrl) {
        setLocalPage(safe);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (safe > 1) params.set("page", String(safe));
      else params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [syncUrl, searchParams, pathname, router],
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      const trimmed = value.trim();
      if (!syncUrl) {
        setLocalFilters((current) => {
          const next = { ...current };
          if (trimmed) next[key] = trimmed;
          else delete next[key];
          return next;
        });
        setLocalPage(1);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set(key, trimmed);
      else params.delete(key);
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [syncUrl, searchParams, pathname, router],
  );

  const setFilters = useCallback(
    (nextFilters: Record<string, string>) => {
      if (!syncUrl) {
        const cleaned: Record<string, string> = {};
        for (const [key, value] of Object.entries(nextFilters)) {
          const trimmed = value.trim();
          if (trimmed) cleaned[key] = trimmed;
        }
        setLocalFilters(cleaned);
        setLocalPage(1);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      for (const key of filterKeys) {
        params.delete(key);
      }
      for (const [key, value] of Object.entries(nextFilters)) {
        const trimmed = value.trim();
        if (trimmed) params.set(key, trimmed);
      }
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [syncUrl, searchParams, pathname, router, filterKeys],
  );

  const page = syncUrl ? urlPage : localPage;

  function pageWindow(meta?: CatalogMeta) {
    const total = meta?.total ?? 0;
    const totalPages = Math.max(1, meta?.totalPages ?? 1);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const from = total === 0 ? 0 : (safePage - 1) * CATALOG_PAGE_SIZE + 1;
    const to = Math.min(safePage * CATALOG_PAGE_SIZE, total);
    return { total, totalPages, safePage, from, to };
  }

  const listPath = (() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    else params.delete("q");
    for (const key of filterKeys) {
      const value = filters[key]?.trim() ?? "";
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  })();

  return {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    filters,
    setFilter,
    setFilters,
    filtersEqual: (other: Record<string, string>) =>
      filtersEqual(filters, other),
    pageWindow,
    listPath,
  };
}
