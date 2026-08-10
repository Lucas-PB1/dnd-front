"use client";

import { useMemo } from "react";

import { useMagicItemsCatalog } from "@/features/catalog/equipment-catalog/api/use-equipment";
import { GearItemCard } from "@/features/catalog/equipment-catalog/ui/gear-item-card";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import {
  MAGIC_ITEM_RARITY_FILTER,
  MAGIC_ITEM_TYPE_FILTER,
} from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { isCatalogPageOutOfRange } from "@/shared/lib/catalog-query";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function isMagicItem(properties: Record<string, unknown> | null | undefined) {
  return properties?.magic === true;
}

export function MagicItemsGrid() {
  const { editionSlugsParam } = useCatalogSources();
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
  } = useCatalogListState({
    syncUrl: true,
    filterKeys: ["rarity", "itemType"],
  });

  const rarity = filters.rarity ?? "";
  const itemType = filters.itemType ?? "";

  const { data, isPending, isError, error, isFetching } = useMagicItemsCatalog({
    page,
    q: debouncedQuery,
    rarity,
    itemType,
    editionSlugs: editionSlugsParam,
  });

  /** Cinto de segurança se a API ainda não filtrar `magic` (processo antigo). */
  const rows = useMemo(
    () => (data?.data ?? []).filter((item) => isMagicItem(item.properties)),
    [data?.data],
  );

  const apiIgnoredMagicFilter =
    Boolean(data?.data?.length) && rows.length < (data?.data.length ?? 0);

  const { total, totalPages, safePage, from, to } = pageWindow(
    apiIgnoredMagicFilter
      ? {
          ...data!.meta,
          // total do meta fica stale; ainda assim paginamos pelo servidor
        }
      : data?.meta,
  );

  const outOfRange = isCatalogPageOutOfRange(data, page, totalPages);
  useClampCatalogPage(outOfRange, setPage);

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

  const hasClientFilters = Boolean(debouncedQuery || rarity || itemType);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar item mágico…"
          resultCount={apiIgnoredMagicFilter ? rows.length : total}
        />
        <CatalogFilters
          fields={[MAGIC_ITEM_TYPE_FILTER, MAGIC_ITEM_RARITY_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {apiIgnoredMagicFilter ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          A API ainda não aplicou o filtro mágico nesta resposta — exibindo só
          itens com flag mágica. Reinicie o backend se a lista parecer
          incompleta.
        </p>
      ) : null}
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !rows.length ? (
        <CatalogEmptyMessage
          message={
            hasClientFilters
              ? "Nenhum item mágico corresponde aos filtros."
              : "Nenhum item mágico encontrado."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {rows.map((item) => (
                <li key={item.slug}>
                  <GearItemCard item={item} listPath={listPath} />
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
