"use client";

import { useWeaponsCatalog } from "@/features/equipment-catalog/api/use-equipment";
import { WeaponCard } from "@/features/equipment-catalog/ui/weapon-card";
import { WEAPON_CATEGORY_FILTER } from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { isCatalogPageOutOfRange } from "@/shared/lib/catalog-query";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function WeaponsGrid() {
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

  const { data, isPending, isError, error, isFetching } = useWeaponsCatalog({
    page,
    q: debouncedQuery,
    category,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  const outOfRange = isCatalogPageOutOfRange(data, page, totalPages);
  useClampCatalogPage(outOfRange, setPage);

  if (isPending && !data) {
    return <p className="text-sm text-muted-foreground">Carregando armas…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar armas"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar arma…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[WEAPON_CATEGORY_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery || category
            ? "Nenhuma arma corresponde aos filtros."
            : "Nenhuma arma encontrada."}
        </p>
      ) : (
        <>
          <div
            className={isFetching ? "opacity-70 transition-opacity" : undefined}
          >
            <ul className="border-t border-border">
              {data.data.map((weapon) => (
                <li key={weapon.slug}>
                  <WeaponCard weapon={weapon} listPath={listPath} />
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
