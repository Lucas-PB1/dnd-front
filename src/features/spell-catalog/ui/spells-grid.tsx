"use client";

import { useSpellsCatalog } from "@/features/spell-catalog/api/use-spells";
import { SpellCard } from "@/features/spell-catalog/ui/spell-card";
import {
  SPELL_LEVEL_FILTER,
  SPELL_SCHOOL_FILTER,
} from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function SpellsGrid() {
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
    filterKeys: ["level", "school"],
  });

  const level = filters.level ?? "";
  const school = filters.school ?? "";

  const { data, isPending, isError, error, isFetching } = useSpellsCatalog({
    page,
    q: debouncedQuery,
    level,
    school,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  const outOfRange =
    !data?.data.length && (data?.meta.total ?? 0) > 0 && page > totalPages;
  useClampCatalogPage(outOfRange, setPage);

  if (isPending && !data) {
    return <p className="text-sm text-muted-foreground">Carregando magias…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar magias"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar magia…"
          resultCount={total}
        />
        <CatalogFilters
          fields={[SPELL_LEVEL_FILTER, SPELL_SCHOOL_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery || level || school
            ? "Nenhuma magia corresponde aos filtros."
            : "Nenhuma magia encontrada."}
        </p>
      ) : (
        <>
          <div
            className={isFetching ? "opacity-70 transition-opacity" : undefined}
          >
            <ul className="divide-y-0 border-t border-border">
              {data.data.map((spell) => (
                <li key={spell.slug}>
                  <SpellCard spell={spell} listPath={listPath} />
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
