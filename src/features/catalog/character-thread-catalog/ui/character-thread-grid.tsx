"use client";

import { useMemo } from "react";

import type { CharacterThreadSummary } from "@/entities/character-thread/types";
import { useCharacterThreadCatalog } from "@/features/catalog/character-thread-catalog/api/use-character-threads";
import { CharacterThreadCard } from "@/features/catalog/character-thread-catalog/ui/character-thread-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: CharacterThreadSummary, b: CharacterThreadSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function CharacterThreadGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const isFiltered = debouncedQuery.trim().length > 0;
  const { data, isPending, isError, error, isFetching } =
    useCharacterThreadCatalog({
      q: debouncedQuery,
    });

  const threads = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(threads, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando threads…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar threads"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar thread…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhuma thread corresponde à busca."
              : "Nenhuma thread encontrada."
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
            {pageItems.map((thread) => (
              <CharacterThreadCard
                key={thread.slug}
                thread={thread}
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
