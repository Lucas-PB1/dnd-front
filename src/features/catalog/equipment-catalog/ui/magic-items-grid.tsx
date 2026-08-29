"use client";

import { useMemo } from "react";

import type { ItemSummary } from "@/entities/item/types";
import { useMagicItemsCatalog } from "@/features/catalog/equipment-catalog/api/use-equipment";
import { GearItemCard } from "@/features/catalog/equipment-catalog/ui/gear-item-card";
import {
  MAGIC_ITEM_RARITY_FILTER,
  MAGIC_ITEM_TYPE_FILTER,
} from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: ItemSummary, b: ItemSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function MagicItemsGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    filters,
    setFilter,
    listPath,
  } = useCatalogListState({
    syncUrl: true,
    filterKeys: ["rarity", "itemType"],
  });

  const rarity = filters.rarity ?? "";
  const itemType = filters.itemType ?? "";
  const isFiltered =
    debouncedQuery.trim().length > 0 || Boolean(rarity) || Boolean(itemType);

  const { data, isPending, isError, error, isFetching } = useMagicItemsCatalog({
    q: debouncedQuery,
    rarity,
    itemType,
  });

  const items = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(items, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando itens mágicos…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar itens mágicos"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar item mágico…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[MAGIC_ITEM_TYPE_FILTER, MAGIC_ITEM_RARITY_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            isFiltered
              ? "Nenhum item mágico corresponde aos filtros."
              : "Nenhum item mágico encontrado."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((item) => (
                <li key={item.slug}>
                  <GearItemCard item={item} listPath={listPath} />
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
