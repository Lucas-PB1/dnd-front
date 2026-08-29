"use client";

import { useMemo } from "react";

import type { BackgroundSummary } from "@/entities/background/types";
import { useBackgroundsCatalog } from "@/features/catalog/background-catalog/api/use-backgrounds";
import { BackgroundCard } from "@/features/catalog/background-catalog/ui/background-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: BackgroundSummary, b: BackgroundSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function BackgroundsGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const isFiltered = debouncedQuery.trim().length > 0;
  const { data, isPending, isError, error, isFetching } = useBackgroundsCatalog({
    q: debouncedQuery,
  });

  const backgrounds = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(backgrounds, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedentes…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar antecedentes"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar antecedente…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhum antecedente corresponde à busca."
              : "Nenhum antecedente encontrado."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((background) => (
                <li key={background.slug}>
                  <BackgroundCard background={background} listPath={listPath} />
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
