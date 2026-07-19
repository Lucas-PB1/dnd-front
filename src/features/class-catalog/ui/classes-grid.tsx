"use client";

import { useClassesCatalog } from "@/features/class-catalog/api/use-classes";
import { ClassCard } from "@/features/class-catalog/ui/class-card";
import { useCatalogListState } from "@/shared/lib/use-catalog-list-state";
import { useClampCatalogPage } from "@/shared/lib/use-clamp-catalog-page";
import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function ClassesGrid() {
  const {
    query,
    setQuery,
    debouncedQuery,
    page,
    setPage,
    pageWindow,
    listPath,
  } = useCatalogListState({ syncUrl: true });

  const { data, isPending, isError, error, isFetching } = useClassesCatalog({
    page,
    q: debouncedQuery,
  });

  const { total, totalPages, safePage, from, to } = pageWindow(data?.meta);

  const outOfRange =
    !data?.data.length && (data?.meta.total ?? 0) > 0 && page > totalPages;
  useClampCatalogPage(outOfRange, setPage);

  if (isPending && !data) {
    return <p className="text-sm text-muted-foreground">Carregando classes…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar classes"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar classe…"
        resultCount={total}
      />
      {outOfRange ? (
        <p className="text-sm text-muted-foreground">Ajustando página…</p>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          {debouncedQuery
            ? "Nenhuma classe corresponde à busca."
            : "Nenhuma classe encontrada."}
        </p>
      ) : (
        <>
          <div
            className={
              isFetching
                ? "grid gap-3 opacity-70 transition-opacity sm:grid-cols-2 lg:grid-cols-3"
                : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {data.data.map((classItem) => (
              <ClassCard
                key={classItem.slug}
                classItem={classItem}
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
