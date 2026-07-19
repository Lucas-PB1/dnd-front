"use client";

import { useGearCatalog } from "@/features/equipment-catalog/api/use-equipment";
import { GearItemCard } from "@/features/equipment-catalog/ui/gear-item-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function GearItemsGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    pageWindow,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const { data, isPending, isError, error, isFetching } = useGearCatalog({
    page,
    q: debouncedQuery,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  if (isPending && !data) {
    return <p className="text-sm text-muted-foreground">Carregando itens…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar itens"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar item…"
        resultCount={total}
      />
      {!data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery
            ? "Nenhum item corresponde à busca."
            : "Nenhum item encontrado."}
        </p>
      ) : (
        <>
          <div
            className={isFetching ? "opacity-70 transition-opacity" : undefined}
          >
            <ul className="border-t border-border">
              {data.data.map((item) => (
                <li key={item.slug}>
                  <GearItemCard item={item} listPath={listPath} />
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
