"use client";

import { useMemo } from "react";

import type { SpeciesSummary } from "@/entities/species/types";
import { useSpeciesCatalog } from "@/features/catalog/species-catalog/api/use-species";
import { SpeciesCard } from "@/features/catalog/species-catalog/ui/species-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: SpeciesSummary, b: SpeciesSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function SpeciesGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const isFiltered = debouncedQuery.trim().length > 0;
  const { data, isPending, isError, error, isFetching } = useSpeciesCatalog({
    q: debouncedQuery,
  });

  const catalogSpecies = useMemo(() => {
    const results = data?.data ?? [];
    return [...results].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(catalogSpecies, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando espécies…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar espécies"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar espécie…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhuma espécie corresponde à busca."
              : "Nenhuma espécie encontrada."
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
            {pageItems.map((species) => (
              <SpeciesCard
                key={species.slug}
                species={species}
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
