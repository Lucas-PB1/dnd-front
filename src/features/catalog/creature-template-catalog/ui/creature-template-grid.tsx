"use client";

import { useMemo } from "react";

import type { CreatureTemplateSummary } from "@/entities/creature-template/types";
import { useCreatureTemplatesCatalog } from "@/features/catalog/creature-template-catalog/api/use-creature-templates";
import { CreatureTemplateCard } from "@/features/catalog/creature-template-catalog/ui/creature-template-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(
  a: CreatureTemplateSummary,
  b: CreatureTemplateSummary,
) {
  return a.name.localeCompare(b.name, "pt");
}

export function CreatureTemplateGrid() {
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
    useCreatureTemplatesCatalog({ q: debouncedQuery });

  const creatures = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(creatures, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando criaturas…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar criaturas"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar criatura…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhuma criatura corresponde à busca."
              : "Nenhuma criatura no catálogo ainda."
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
              <CreatureTemplateCard
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
