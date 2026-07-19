"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";

type CatalogMeta = {
  total?: number;
  totalPages?: number;
};

type UseCatalogListStateOptions = {
  /** Persiste `q` e `page` na URL (mantém listagem ao voltar do detalhe). */
  syncUrl?: boolean;
};

/** Estado de busca + página para listagens paginadas do catálogo. */
export function useCatalogListState(options?: UseCatalogListStateOptions) {
  const syncUrl = options?.syncUrl ?? false;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const [query, setQuery] = useState(syncUrl ? urlQuery : "");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [page, setPageState] = useState(syncUrl ? urlPage : 1);
  const [pageQuery, setPageQuery] = useState(debouncedQuery);

  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  const [seenUrlPage, setSeenUrlPage] = useState(urlPage);

  // Hidrata input/página quando a URL muda (voltar/avançar) — durante o render.
  if (syncUrl && urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    setQuery(urlQuery);
    setPageQuery(urlQuery);
  }
  if (syncUrl && urlPage !== seenUrlPage) {
    setSeenUrlPage(urlPage);
    setPageState(urlPage);
  }

  if (pageQuery !== debouncedQuery) {
    setPageQuery(debouncedQuery);
    // Evita zerar a página ao ecoar a URL após voltar do detalhe.
    if (!(syncUrl && debouncedQuery === urlQuery)) {
      setPageState(1);
    }
  }

  useEffect(() => {
    if (!syncUrl) return;

    // Debounce atrasado após hidratar da URL: não reescreve o `q` antigo.
    if (query === urlQuery && debouncedQuery !== urlQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    else params.delete("q");

    const nextPage = query === urlQuery ? page : 1;
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");

    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [
    syncUrl,
    query,
    debouncedQuery,
    page,
    urlQuery,
    pathname,
    router,
    searchParams,
  ]);

  function setPage(next: number) {
    setPageState(next);
    if (!syncUrl) return;

    const params = new URLSearchParams(searchParams.toString());
    if (next > 1) params.set("page", String(next));
    else params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const activePage =
    syncUrl && debouncedQuery !== urlQuery ? 1 : syncUrl ? urlPage : page;

  function pageWindow(meta?: CatalogMeta) {
    const total = meta?.total ?? 0;
    const totalPages = Math.max(1, meta?.totalPages ?? 1);
    const safePage = Math.min(Math.max(1, activePage), totalPages);
    const from = total === 0 ? 0 : (safePage - 1) * CATALOG_PAGE_SIZE + 1;
    const to = Math.min(safePage * CATALOG_PAGE_SIZE, total);
    return { total, totalPages, safePage, from, to };
  }

  const listPath = (() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    else params.delete("q");
    if (activePage > 1) params.set("page", String(activePage));
    else params.delete("page");
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  })();

  return {
    query,
    setQuery,
    debouncedQuery,
    page: activePage,
    setPage,
    pageWindow,
    listPath,
  };
}
