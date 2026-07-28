"use client";

import { useBackgroundsCatalog } from "@/features/catalog/background-catalog/api/use-backgrounds";
import { BackgroundCard } from "@/features/catalog/background-catalog/ui/background-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { CatalogEmptyMessage } from "@/shared/ui/catalog-empty-message";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export function BackgroundsGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    pageWindow,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const { data, isPending, isError, error, isFetching } = useBackgroundsCatalog(
    {
      page,
      q: debouncedQuery,
    },
  );

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  if (isPending && !data) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedentes…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar antecedentes"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar antecedente…"
        resultCount={total}
      />
      {!data?.data.length ? (
        <CatalogEmptyMessage
          message={
            debouncedQuery
            ? "Nenhum antecedente corresponde à busca."
            : "Nenhum antecedente encontrado."
          }
        />
      ) : (
        <>
          <div
            className={cn(isFetching && "opacity-70 transition-opacity")}
          >
            <ul className={cn("border-t border-border", motion.stagger)}>
              {data.data.map((background) => (
                <li key={background.slug}>
                  <BackgroundCard background={background} listPath={listPath} />
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
