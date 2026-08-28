"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { ITEM_TYPE_LABELS_PT, type ItemSummary } from "@/entities/item/types";
import { useAllItems } from "@/features/catalog/item-catalog/api/use-items";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { toMetricProse } from "@/shared/lib/metric";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

const TYPE_FILTERS = [
  { value: "", label: "Todos" },
  ...Object.entries(ITEM_TYPE_LABELS_PT).map(([value, label]) => ({
    value,
    label,
  })),
] as const;

type ItemPickerProps = {
  id: string;
  value: string;
  onChange: (slug: string) => void;
  /** Item selecionado (para preço etc.) ou null se limpar. */
  onItemChange?: (item: ItemSummary | null) => void;
  excludeSlugs?: string[];
  disabled?: boolean;
};

/** Catálogo estilo Beyond: busca + chips de tipo + lista selecionável. */
export function ItemPicker({
  id,
  value,
  onChange,
  onItemChange,
  excludeSlugs = [],
  disabled,
}: ItemPickerProps) {
  const [search, setSearch] = useState("");
  const [itemType, setItemType] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const itemsQuery = useAllItems(
    {
      q: debouncedSearch.trim() || undefined,
      itemType: itemType || undefined,
    },
    true,
  );

  const excluded = useMemo(() => new Set(excludeSlugs), [excludeSlugs]);

  const items = useMemo(() => {
    return (itemsQuery.data?.data ?? []).filter(
      (item) => !excluded.has(item.slug),
    );
  }, [excluded, itemsQuery.data?.data]);

  const total = itemsQuery.data?.meta.total ?? 0;
  const listId = `${id}-results`;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="space-y-2">
        <label className="relative block">
          <span className="sr-only">Buscar item</span>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={`${id}-search`}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome…"
            disabled={disabled}
            className="pl-9"
            autoComplete="off"
          />
        </label>

        <div
          role="group"
          aria-label="Filtrar por tipo"
          className="flex flex-wrap gap-1.5"
        >
          {TYPE_FILTERS.map((filter) => {
            const active = itemType === filter.value;
            return (
              <button
                key={filter.value || "all"}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => setItemType(filter.value)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "border-primary/50 bg-primary/15 text-foreground"
                    : "border-border/70 bg-background/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {itemsQuery.isPending
            ? "Carregando…"
            : items.length === 0
              ? "Nenhum resultado"
              : `${items.length}${total > items.length ? ` de ${total}` : ""} itens`}
        </p>
        {value ? (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            disabled={disabled}
            onClick={() => onChange("")}
          >
            Limpar seleção
          </button>
        ) : null}
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label="Itens do catálogo"
        aria-busy={itemsQuery.isPending}
        className={cn(
          "max-h-[min(22rem,45vh)] overflow-y-auto rounded-lg border border-border/70 bg-background/40",
          itemsQuery.isFetching && "opacity-80",
        )}
      >
        {itemsQuery.isError ? (
          <p className="px-3 py-4 text-sm text-destructive" role="alert">
            Não foi possível carregar o catálogo.
          </p>
        ) : itemsQuery.isPending && items.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            Carregando catálogo…
          </p>
        ) : items.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            {debouncedSearch.trim() || itemType
              ? "Nada corresponde aos filtros."
              : "Nenhum item no catálogo."}
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {items.map((item) => (
              <ItemResultRow
                key={item.slug}
                item={item}
                selected={value === item.slug}
                disabled={disabled}
                onSelect={() => {
                  onChange(item.slug);
                  onItemChange?.(item);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ItemResultRow({
  item,
  selected,
  disabled,
  onSelect,
}: {
  item: ItemSummary;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const typeLabel = ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;
  const meta = [typeLabel, item.costText, item.weight ? toMetricProse(item.weight) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors",
          "focus-visible:bg-muted/60 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selected
            ? "bg-primary/15 ring-inset ring-1 ring-primary/30"
            : "hover:bg-muted/40",
        )}
      >
        <span className="font-medium">{item.name}</span>
        {meta ? (
          <span className="text-xs text-muted-foreground">{meta}</span>
        ) : null}
      </button>
    </li>
  );
}
