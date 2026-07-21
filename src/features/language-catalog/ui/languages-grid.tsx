"use client";

import { useLanguagesCatalog } from "@/features/language-catalog/api/use-languages";
import { LanguageCard } from "@/features/language-catalog/ui/language-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { isCatalogPageOutOfRange } from "@/shared/lib/catalog-query";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { RARE_FILTER } from "@/shared/lib/catalog-filter-options";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export function LanguagesGrid() {
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
  } = useCatalogListState({ syncUrl: true, filterKeys: ["rare"] });

  const rare = filters.rare ?? "";

  const { data, isPending, isError, error, isFetching } = useLanguagesCatalog({
    page,
    q: debouncedQuery,
    rare,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  const outOfRange = isCatalogPageOutOfRange(data, page, totalPages);
  useClampCatalogPage(outOfRange, setPage);

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
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery || rare
            ? "Nenhum idioma corresponde aos filtros."
            : "Nenhum idioma encontrado."}
        </p>
      ) : (
        <>
          <div
            className={cn(isFetching && "opacity-70 transition-opacity")}
          >
            <ul className={cn("border-t border-border", motion.stagger)}>
              {data.data.map((language) => (
                <li key={language.slug}>
                  <LanguageCard language={language} listPath={listPath} />
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
