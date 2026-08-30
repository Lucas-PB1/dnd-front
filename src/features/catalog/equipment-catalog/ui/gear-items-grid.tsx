"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ItemSummary } from "@/entities/item/types";
import { editionMenuLabel } from "@/entities/edition/catalog-sources";
import { editionsKeys, fetchEditions } from "@/entities/edition/api";
import { useGearCatalog } from "@/features/catalog/equipment-catalog/api/use-equipment";
import { filterGearCatalogItems } from "@/features/catalog/equipment-catalog/lib/gear-catalog-filters";
import { GearItemCard } from "@/features/catalog/equipment-catalog/ui/gear-item-card";
import {
  GEAR_CATALOG_KIND_FILTER,
  ITEM_TYPE_FILTER,
} from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: ItemSummary, b: ItemSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function GearItemsGrid() {
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
    filterKeys: ["itemType", "catalogKind", "editionSlug"],
  });

  const itemType = filters.itemType ?? "";
  const catalogKind = filters.catalogKind ?? "";
  const editionSlug = filters.editionSlug ?? "";
  const isFiltered =
    debouncedQuery.trim().length > 0 ||
    Boolean(itemType) ||
    Boolean(catalogKind) ||
    Boolean(editionSlug);

  const editions = useQuery({
    queryKey: editionsKeys.all,
    queryFn: fetchEditions,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  const editionOptions = useMemo(
    () =>
      (editions.data ?? []).map((edition) => ({
        value: edition.slug,
        label: editionMenuLabel(edition),
      })),
    [editions.data],
  );

  const { data, isPending, isError, error, isFetching } = useGearCatalog({
    q: debouncedQuery,
    itemType,
    editionSlug,
  });

  const items = useMemo(() => {
    const rows = data?.data ?? [];
    return filterGearCatalogItems([...rows], catalogKind).sort(sortByName);
  }, [catalogKind, data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(items, page, isFiltered);

  if (isPending && !data) {
    return <p className="text-sm text-muted-foreground">Carregando itens…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar itens"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <CatalogSearch
            value={query}
            onChange={setQuery}
            placeholder="Buscar item…"
            resultCount={total}
          />
          <CatalogFilters
            fields={[ITEM_TYPE_FILTER, GEAR_CATALOG_KIND_FILTER]}
            values={filters}
            onChange={setFilter}
          />
        </div>
        <div className="max-w-xs">
          <SearchableSelect
            id="gear-edition-filter"
            value={editionSlug}
            onValueChange={(next) => setFilter("editionSlug", next)}
            options={[{ value: "", label: "Todas as fontes" }, ...editionOptions]}
            placeholder="Fonte"
            aria-label="Filtrar por fonte"
          />
        </div>
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || itemType || catalogKind || editionSlug
              ? "Nenhum item corresponde aos filtros."
              : "Nenhum item encontrado."
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
