"use client";

import { useMemo } from "react";

import type { HeritageCompendiumItem } from "@/entities/heritage/types";
import { useHeritageCatalog } from "@/features/catalog/heritage-catalog/api/use-heritages";
import { HeritageCard } from "@/features/catalog/heritage-catalog/ui/heritage-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: HeritageCompendiumItem, b: HeritageCompendiumItem) {
  return a.name.localeCompare(b.name, "pt");
}

export function HeritageGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const isFiltered = debouncedQuery.trim().length > 0;
  const { data, isPending, isError, error, isFetching } = useHeritageCatalog({
    q: debouncedQuery,
  });

  const catalogHeritages = useMemo(() => {
    const results = (data?.data ?? []) as HeritageCompendiumItem[];
    return [...results].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(catalogHeritages, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando heranças…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar heranças"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar herança…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhuma herança corresponde à busca."
              : "Nenhuma herança encontrada."
          }
        />
      ) : (
        <>
          <div
            className={cn(
              "grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>*]:h-full",
              motion.stagger,
              isFetching && "opacity-70 transition-opacity",
            )}
          >
            {pageItems.map((heritage) => (
              <HeritageCard
                key={heritage.slug}
                heritage={heritage}
                listPath={listPath}
              />
            ))}
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
