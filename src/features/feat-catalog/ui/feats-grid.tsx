"use client";

import { useFeatsCatalog } from "@/features/feat-catalog/api/use-feats";
import { FeatCard } from "@/features/feat-catalog/ui/feat-card";
import { FEAT_CATEGORY_FILTER } from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function FeatsGrid() {
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
  } = useCatalogListState({ syncUrl: true, filterKeys: ["category"] });

  const category = filters.category ?? "";

  const { data, isPending, isError, error, isFetching } = useFeatsCatalog({
    page,
    q: debouncedQuery,
    category,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  const outOfRange =
    !data?.data.length && (data?.meta.total ?? 0) > 0 && page > totalPages;
  useClampCatalogPage(outOfRange, setPage);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando talentos…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar talentos"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar talento…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[FEAT_CATEGORY_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery || category
            ? "Nenhum talento corresponde aos filtros."
            : "Nenhum talento encontrado."}
        </p>
      ) : (
        <>
          <div
            className={isFetching ? "opacity-70 transition-opacity" : undefined}
          >
            <ul className="border-t border-border">
              {data.data.map((feat) => (
                <li key={feat.slug}>
                  <FeatCard feat={feat} listPath={listPath} />
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
