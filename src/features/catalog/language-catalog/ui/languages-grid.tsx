"use client";

import { useMemo } from "react";

import type { LanguageSummary } from "@/entities/language/types";
import { useLanguagesCatalog } from "@/features/catalog/language-catalog/api/use-languages";
import { LanguageCard } from "@/features/catalog/language-catalog/ui/language-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { RARE_FILTER } from "@/shared/lib/catalog-filter-options";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: LanguageSummary, b: LanguageSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function LanguagesGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    filters,
    setFilter,
    listPath,
  } = useCatalogListState({ syncUrl: true, filterKeys: ["rare"] });

  const rare = filters.rare ?? "";
  const isFiltered =
    debouncedQuery.trim().length > 0 || Boolean(rare);

  const { data, isPending, isError, error, isFetching } = useLanguagesCatalog({
    q: debouncedQuery,
    rare,
  });

  const languages = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(languages, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando idiomas…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar idiomas"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar idioma…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[RARE_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || rare
              ? "Nenhum idioma corresponde aos filtros."
              : "Nenhum idioma encontrado."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((language) => (
                <li key={language.slug}>
                  <LanguageCard language={language} listPath={listPath} />
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
