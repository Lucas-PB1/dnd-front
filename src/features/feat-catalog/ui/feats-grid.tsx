"use client";

import { useFeatsCatalog } from "@/features/feat-catalog/api/use-feats";
import { FeatCard } from "@/features/feat-catalog/ui/feat-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function FeatsGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    pageWindow,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const { data, isPending, isError, error, isFetching } = useFeatsCatalog({
    page,
    q: debouncedQuery,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

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
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar talento…"
        resultCount={total}
      />
      {!data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery
            ? "Nenhum talento corresponde à busca."
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
