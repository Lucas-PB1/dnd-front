"use client";

import { useMemo } from "react";

import type { SubclassSummary } from "@/entities/subclass/types";
import {
  useSubclassClassOptions,
  useSubclassesCatalog,
} from "@/features/catalog/subclass-catalog/api/use-subclasses";
import { SubclassCard } from "@/features/catalog/subclass-catalog/ui/subclass-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import {
  CatalogFilters,
  type CatalogFilterField,
} from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: SubclassSummary, b: SubclassSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function SubclassesGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    filters,
    setFilter,
    listPath,
  } = useCatalogListState({ syncUrl: true, filterKeys: ["class"] });

  const classSlug = filters.class ?? "";
  const isFiltered =
    debouncedQuery.trim().length > 0 || Boolean(classSlug);

  const { data, isPending, isError, error, isFetching } = useSubclassesCatalog({
    q: debouncedQuery,
    class: classSlug,
  });

  const { data: classesData } = useSubclassClassOptions();

  const classFilter = useMemo<CatalogFilterField>(() => {
    const options =
      classesData?.data.map((c) => ({
        value: c.slug,
        label: c.name,
      })) ?? [];
    return {
      key: "class",
      label: "Classe",
      options,
    };
  }, [classesData]);

  const subclasses = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(subclasses, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando subclasses…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar subclasses"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar subclasse…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[classFilter]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || classSlug
              ? "Nenhuma subclasse corresponde aos filtros."
              : "Nenhuma subclasse encontrada."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((subclass) => (
                <li key={subclass.slug}>
                  <SubclassCard subclass={subclass} listPath={listPath} />
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
