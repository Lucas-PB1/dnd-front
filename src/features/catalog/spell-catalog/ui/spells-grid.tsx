"use client";

import { useMemo } from "react";

import type { SpellSummary } from "@/entities/spell/types";
import { useSpellsCatalog } from "@/features/catalog/spell-catalog/api/use-spells";
import { SpellCard } from "@/features/catalog/spell-catalog/ui/spell-card";
import {
  SPELL_LEVEL_FILTER,
  SPELL_SCHOOL_FILTER,
} from "@/shared/lib/catalog-filter-options";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: SpellSummary, b: SpellSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function SpellsGrid() {
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
    filterKeys: ["level", "school"],
  });

  const level = filters.level ?? "";
  const school = filters.school ?? "";
  const isFiltered =
    debouncedQuery.trim().length > 0 || Boolean(level) || Boolean(school);

  const { data, isPending, isError, error, isFetching } = useSpellsCatalog({
    q: debouncedQuery,
    level,
    school,
  });

  const spells = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(spells, page, isFiltered);

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
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || level || school
              ? "Nenhuma magia corresponde aos filtros."
              : "Nenhuma magia encontrada."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul
              className={cn(
                "divide-y-0 border-t border-border",
                motion.stagger,
              )}
            >
              {pageItems.map((spell) => (
                <li key={spell.slug}>
                  <SpellCard spell={spell} listPath={listPath} />
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
