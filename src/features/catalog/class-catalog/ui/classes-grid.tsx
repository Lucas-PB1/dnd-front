"use client";

import { useMemo } from "react";

import type { ClassSummary } from "@/entities/class/types";
import { useClassesCatalog } from "@/features/catalog/class-catalog/api/use-classes";
import { ClassCard } from "@/features/catalog/class-catalog/ui/class-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: ClassSummary, b: ClassSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function ClassesGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const isFiltered = debouncedQuery.trim().length > 0;
  const { data, isPending, isError, error, isFetching } = useClassesCatalog({
    q: debouncedQuery,
  });

  const classes = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(classes, page, isFiltered);

  if (isPending && !data) {
    return <p className="text-sm text-muted-foreground">Carregando classes…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar classes"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar classe…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhuma classe corresponde à busca."
              : "Nenhuma classe encontrada."
          }
        />
      ) : (
        <>
          <div
            className={cn(
              "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
              motion.stagger,
              isFetching && "opacity-70 transition-opacity",
            )}
          >
            {pageItems.map((classItem) => (
              <ClassCard
                key={classItem.slug}
                classItem={classItem}
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
