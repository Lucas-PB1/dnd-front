"use client";

import { useCreatureTemplatesCatalog } from "@/features/catalog/creature-template-catalog/api/use-creature-templates";
import { CreatureTemplateCard } from "@/features/catalog/creature-template-catalog/ui/creature-template-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { isCatalogPageOutOfRange } from "@/shared/lib/catalog-query";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export function CreatureTemplateGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    pageWindow,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const { data, isPending, isError, error, isFetching } =
    useCreatureTemplatesCatalog({ page, q: debouncedQuery });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);
  const outOfRange = isCatalogPageOutOfRange(data, page, totalPages);
  useClampCatalogPage(outOfRange, setPage);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando criaturas…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar criaturas"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar criatura…"
        resultCount={total}
      />
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
              ? "Nenhuma criatura corresponde à busca."
              : "Nenhuma criatura no catálogo ainda."
          }
        />
      ) : (
        <>
          <div
            className={cn(
              "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
              motion.stagger,
              isFetching && "opacity-70 transition-opacity",
            )}
          >
            {data.data.map((template) => (
              <CreatureTemplateCard
                key={template.slug}
                template={template}
                listPath={listPath}
              />
            ))}
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
