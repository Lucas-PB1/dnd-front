"use client";

import { useSkillsCatalog } from "@/features/skill-catalog/api/use-skills";
import { SkillCard } from "@/features/skill-catalog/ui/skill-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { isCatalogPageOutOfRange } from "@/shared/lib/catalog-query";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { ABILITY_FILTER } from "@/shared/lib/catalog-filter-options";
import { CatalogFilters } from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export function SkillsGrid() {
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
  } = useCatalogListState({ syncUrl: true, filterKeys: ["ability"] });

  const ability = filters.ability ?? "";

  const { data, isPending, isError, error, isFetching } = useSkillsCatalog({
    page,
    q: debouncedQuery,
    ability,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  const outOfRange = isCatalogPageOutOfRange(data, page, totalPages);
  useClampCatalogPage(outOfRange, setPage);

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
        <CatalogFilters
          fields={[ABILITY_FILTER]}
          values={filters}
          onChange={setFilter}
        />
      </div>
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery || ability
            ? "Nenhuma perícia corresponde aos filtros."
            : "Nenhuma perícia encontrada."}
        </p>
      ) : (
        <>
          <div
            className={cn(isFetching && "opacity-70 transition-opacity")}
          >
            <ul className={cn("border-t border-border", motion.stagger)}>
              {data.data.map((skill) => (
                <li key={skill.slug}>
                  <SkillCard skill={skill} listPath={listPath} />
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
