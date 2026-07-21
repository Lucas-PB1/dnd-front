"use client";

import { useMemo } from "react";

import {
  useSubclassClassOptions,
  useSubclassesCatalog,
} from "@/features/subclass-catalog/api/use-subclasses";
import { SubclassCard } from "@/features/subclass-catalog/ui/subclass-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { isCatalogPageOutOfRange } from "@/shared/lib/catalog-query";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import {
  CatalogFilters,
  type CatalogFilterField,
} from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export function SubclassesGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    filters,
    setFilter,
    pageWindow,
    listPath,
  } = useCatalogListState({ syncUrl: true, filterKeys: ["class"] });

  const classSlug = filters.class ?? "";

  const { data, isPending, isError, error, isFetching } = useSubclassesCatalog({
    page,
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

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  const outOfRange = isCatalogPageOutOfRange(data, page, totalPages);
  useClampCatalogPage(outOfRange, setPage);

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
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery || classSlug
            ? "Nenhuma subclasse corresponde aos filtros."
            : "Nenhuma subclasse encontrada."}
        </p>
      ) : (
        <>
          <div
            className={cn(isFetching && "opacity-70 transition-opacity")}
          >
            <ul className={cn("border-t border-border", motion.stagger)}>
              {data.data.map((subclass) => (
                <li key={subclass.slug}>
                  <SubclassCard subclass={subclass} listPath={listPath} />
                </li>
              ))}
            </ul>
          </div>
          <CatalogPagination
            page={safePage}
            totalPages={totalPages}
            total={total}
            from={from}
            to={to}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
