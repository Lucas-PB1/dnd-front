"use client";

import { useMemo } from "react";

import type { VehicleTemplateSummary } from "@/entities/vehicle-template/types";
import { useVehicleTemplatesCatalog } from "@/features/catalog/vehicle-template-catalog/api/use-vehicle-templates";
import { VehicleTemplateCard } from "@/features/catalog/vehicle-template-catalog/ui/vehicle-template-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: VehicleTemplateSummary, b: VehicleTemplateSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function VehicleTemplateGrid() {
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
    useVehicleTemplatesCatalog({ q: debouncedQuery });

  const vehicles = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(vehicles, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando veículos…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar veículos"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar veículo…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhum veículo corresponde à busca."
              : "Nenhum veículo no catálogo ainda."
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
            {pageItems.map((template) => (
              <VehicleTemplateCard
                key={template.slug}
                template={template}
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
