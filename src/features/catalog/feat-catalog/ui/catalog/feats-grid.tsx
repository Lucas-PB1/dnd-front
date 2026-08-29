"use client";

import { useMemo } from "react";

import type { FeatSummary } from "@/entities/feat/types";
import { useFeatsCatalog } from "@/features/catalog/feat-catalog/api/use-feats";
import { FeatCard } from "@/features/catalog/feat-catalog/ui/catalog/feat-card";
import { FEAT_CATEGORY_FILTER } from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: FeatSummary, b: FeatSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function FeatsGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    filters,
    setFilter,
    listPath,
  } = useCatalogListState({ syncUrl: true, filterKeys: ["category"] });

  const category = filters.category ?? "";
  const isFiltered =
    debouncedQuery.trim().length > 0 || Boolean(category);

  const { data, isPending, isError, error, isFetching } = useFeatsCatalog({
    q: debouncedQuery,
    category,
  });

  const feats = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(feats, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando talentos…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar talentos"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar talento…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[FEAT_CATEGORY_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || category
              ? "Nenhum talento corresponde aos filtros."
              : "Nenhum talento encontrado."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((feat) => (
                <li key={feat.slug}>
                  <FeatCard feat={feat} listPath={listPath} />
                </li>
              ))}
            </ul>
          </div>
          {isFiltered && totalPages > 1 ? (
            <CatalogPagination
              page={safePage}
              totalPages={totalPages}
              total={total}
              from={from}
              to={to}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
