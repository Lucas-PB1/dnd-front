"use client";

import { useCallback } from "react";

import { CatalogPagination } from "@/shared/ui/catalog-pagination";
import { CatalogSearch } from "@/shared/ui/catalog-search";
import { useClientPaginatedSearch } from "@/shared/lib/use-client-paginated-search";
import { cn } from "@/shared/lib/utils";

const TRAITS_PER_PAGE = 12;

export type PaginatedTraitChoiceOption = {
  choiceSlug: string;
  choiceName: string;
  level1Benefit: string | null;
};

type PaginatedTraitChoiceListProps = {
  options: PaginatedTraitChoiceOption[];
  selected?: string;
  name: string;
  onSelect: (slug: string) => void;
};

export function PaginatedTraitChoiceList({
  options,
  selected,
  name,
  onSelect,
}: PaginatedTraitChoiceListProps) {
  const getSearchText = useCallback(
    (option: PaginatedTraitChoiceOption) =>
      [option.choiceName, option.level1Benefit ?? ""].join(" "),
    [],
  );

  const {
    query,
    setQuery,
    pagedItems,
    page,
    setPage,
    totalPages,
    total,
    from,
    to,
  } = useClientPaginatedSearch({
    items: options,
    getSearchText,
    pageSize: TRAITS_PER_PAGE,
  });

  return (
    <div className="space-y-3">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar traço por nome ou benefício…"
        resultCount={query.trim() ? total : undefined}
      />

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum traço corresponde à busca.
        </p>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {pagedItems.map((option) => (
              <label
                key={option.choiceSlug}
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-sm",
                  selected === option.choiceSlug && "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  checked={selected === option.choiceSlug}
                  onChange={() => onSelect(option.choiceSlug)}
                  className="mt-0.5 size-4 shrink-0"
                />
                <span className="min-w-0 leading-snug">{option.choiceName}</span>
              </label>
            ))}
          </div>

          <CatalogPagination
            page={page}
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
