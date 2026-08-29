"use client";

import { useMemo } from "react";

import type { FightingStyleSummary } from "@/entities/fighting-style/types";
import { useFightingStylesCatalog } from "@/features/catalog/fighting-style-catalog/api/use-fighting-styles";
import { FightingStyleCard } from "@/features/catalog/fighting-style-catalog/ui/fighting-style-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: FightingStyleSummary, b: FightingStyleSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function FightingStylesGrid() {
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
    useFightingStylesCatalog({ q: debouncedQuery });

  const styles = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(styles, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando estilos de luta…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar estilos de luta"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar estilo…"
        resultCount={total}
      />
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhum estilo corresponde à busca."
              : "Nenhum estilo de luta encontrado."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((style) => (
                <li key={style.slug}>
                  <FightingStyleCard style={style} listPath={listPath} />
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
