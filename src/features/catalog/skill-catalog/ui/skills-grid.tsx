"use client";

import { useMemo } from "react";

import type { SkillSummary } from "@/entities/skill/types";
import { useSkillsCatalog } from "@/features/catalog/skill-catalog/api/use-skills";
import { SkillCard } from "@/features/catalog/skill-catalog/ui/skill-card";
import { useAbilities } from "@/features/catalog/reference-catalog/api/use-reference";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { paginateCatalogItems } from "@/shared/lib/catalog-pagination";
import { buildAbilityFilter } from "@/shared/lib/catalog-filter-options";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

function sortByName(a: SkillSummary, b: SkillSummary) {
  return a.name.localeCompare(b.name, "pt");
}

export function SkillsGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    filters,
    setFilter,
    listPath,
  } = useCatalogListState({ syncUrl: true, filterKeys: ["ability"] });

  const abilitiesQuery = useAbilities();
  const abilities = abilitiesQuery.data?.data ?? [];
  const abilityFilter = buildAbilityFilter(abilities);

  const ability = filters.ability ?? "";
  const isFiltered =
    debouncedQuery.trim().length > 0 || Boolean(ability);

  const { data, isPending, isError, error, isFetching } = useSkillsCatalog({
    q: debouncedQuery,
    ability,
  });

  const skills = useMemo(() => {
    const rows = data?.data ?? [];
    return [...rows].sort(sortByName);
  }, [data?.data]);

  const { pageItems, total, totalPages, safePage, from, to } =
    paginateCatalogItems(skills, page, isFiltered);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando perícias…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar perícias"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CatalogSearch
          value={query}
          onChange={setQuery}
          placeholder="Buscar perícia…"
          resultCount={total}
        />
        {abilities.length > 0 ? (
          <CatalogFilters
            fields={[abilityFilter]}
            values={filters}
            onChange={setFilter}
          />
        ) : null}
      </div>
      {pageItems.length === 0 ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery || ability
              ? "Nenhuma perícia corresponde aos filtros."
              : "Nenhuma perícia encontrada."
          }
        />
      ) : (
        <>
          <div className={cn(isFetching && "opacity-70 transition-opacity")}>
            <ul className={cn("border-t border-border", motion.stagger)}>
              {pageItems.map((skill) => (
                <li key={skill.slug}>
                  <SkillCard skill={skill} listPath={listPath} />
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
