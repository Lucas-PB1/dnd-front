"use client";

import { useMemo } from "react";

import type { SpellSummary } from "@/entities/spell/types";
import { useSpellsCatalog } from "@/features/catalog/spell-catalog/api/use-spells";
import { SpellCard } from "@/features/catalog/spell-catalog/ui/spell-card";
import {
  SPELL_CASTING_TIME_FILTER,
  SPELL_CONCENTRATION_FILTER,
  SPELL_LEVEL_FILTER,
  SPELL_RANGE_KIND_FILTER,
  SPELL_RITUAL_FILTER,
  SPELL_ROLL_FILTER,
  SPELL_SAVE_ABILITY_FILTER,
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

const SPELL_FILTER_KEYS = [
  "level",
  "school",
  "ritual",
  "concentration",
  "roll",
  "castingTime",
  "saveAbility",
  "rangeKind",
] as const;

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
    filterKeys: [...SPELL_FILTER_KEYS],
  });

  const level = filters.level ?? "";
  const school = filters.school ?? "";
  const ritual = filters.ritual ?? "";
  const concentration = filters.concentration ?? "";
  const roll = filters.roll ?? "";
  const castingTime = filters.castingTime ?? "";
  const saveAbility = filters.saveAbility ?? "";
  const rangeKind = filters.rangeKind ?? "";

  const hasStructuredFilter = SPELL_FILTER_KEYS.some(
    (key) => (filters[key] ?? "").trim().length > 0,
  );

  const { data, isPending, isError, error, isFetching } = useSpellsCatalog({
    q: debouncedQuery,
    level,
    school,
    ritual,
    concentration,
    roll,
    castingTime,
    saveAbility,
    rangeKind,
  });

  const spells = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(spells, page, true);

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
          fields={[
            SPELL_LEVEL_FILTER,
            SPELL_SCHOOL_FILTER,
            SPELL_CASTING_TIME_FILTER,
            SPELL_RANGE_KIND_FILTER,
            SPELL_SAVE_ABILITY_FILTER,
            SPELL_ROLL_FILTER,
            SPELL_RITUAL_FILTER,
            SPELL_CONCENTRATION_FILTER,
          ]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || hasStructuredFilter
              ? "Nenhuma magia corresponde aos filtros."
              : "Nenhuma magia encontrada."
          }
        />
      ) : (
        <>
          <div
            className={cn(
              "grid auto-rows-fr gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*]:h-full",
              motion.stagger,
              isFetching && "opacity-70 transition-opacity",
            )}
          >
            {pageItems.map((spell) => (
              <SpellCard
                key={spell.slug}
                spell={spell}
                listPath={listPath}
              />
            ))}
          </div>
          {totalPages > 1 ? (
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
