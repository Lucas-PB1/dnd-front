"use client";

import { useMemo } from "react";

import type { ArmorSummary } from "@/entities/armor/types";
import { useArmorCatalog } from "@/features/catalog/equipment-catalog/api/use-equipment";
import { ArmorCard } from "@/features/catalog/equipment-catalog/ui/armor-card";
import { ARMOR_CATEGORY_FILTER } from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: ArmorSummary, b: ArmorSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function ArmorGrid() {
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

  const { data, isPending, isError, error, isFetching } = useArmorCatalog({
    q: debouncedQuery,
    category,
  });

  const armor = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(armor, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando armaduras…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar armaduras"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar armadura…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[ARMOR_CATEGORY_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || category
              ? "Nenhuma armadura corresponde aos filtros."
              : "Nenhuma armadura encontrada."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((armorItem) => (
                <li key={armorItem.slug}>
                  <ArmorCard armor={armorItem} listPath={listPath} />
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
