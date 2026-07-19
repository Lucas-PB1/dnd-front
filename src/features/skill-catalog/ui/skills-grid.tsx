"use client";

import { useSkillsCatalog } from "@/features/skill-catalog/api/use-skills";
import { SkillCard } from "@/features/skill-catalog/ui/skill-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import {
  CatalogFilters,
  type CatalogFilterField,
} from "@/shared/ui/catalog-filters";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";

const ABILITY_FILTER: CatalogFilterField = {
  key: "ability",
  label: "Atributo",
  options: [
    { value: "forca", label: "Força" },
    { value: "destreza", label: "Destreza" },
    { value: "constituicao", label: "Constituição" },
    { value: "inteligencia", label: "Inteligência" },
    { value: "sabedoria", label: "Sabedoria" },
    { value: "carisma", label: "Carisma" },
  ],
};

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

  const outOfRange =
    !data?.data.length && (data?.meta.total ?? 0) > 0 && page > totalPages;
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
            className={isFetching ? "opacity-70 transition-opacity" : undefined}
          >
            <ul className="border-t border-border">
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
