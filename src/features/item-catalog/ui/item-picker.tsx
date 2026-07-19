"use client";

import { useMemo, useState } from "react";

import { ITEM_TYPE_LABELS_PT, type ItemSummary } from "@/entities/item/types";
import { useItems } from "@/features/item-catalog/api/use-items";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { Field, FieldDescription, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";

type ItemPickerProps = {
  id: string;
  value: string;
  onChange: (slug: string) => void;
  excludeSlugs?: string[];
  disabled?: boolean;
};

export function ItemPicker({
  id,
  value,
  onChange,
  excludeSlugs = [],
  disabled,
}: ItemPickerProps) {
  const [search, setSearch] = useState("");
  const [itemType, setItemType] = useState("");

  const itemsQuery = useItems(
    {
      q: search.trim() || undefined,
      itemType: itemType || undefined,
      limit: 100,
    },
    true,
  );

  const excluded = useMemo(() => new Set(excludeSlugs), [excludeSlugs]);

  const options = useMemo(() => {
    return (itemsQuery.data?.data ?? [])
      .filter((item) => !excluded.has(item.slug))
      .map((item) => ({
        value: item.slug,
        label: formatItemOptionLabel(item),
      }));
  }, [excluded, itemsQuery.data?.data]);

  const selected = (itemsQuery.data?.data ?? []).find((i) => i.slug === value);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-search`}>Buscar</FieldLabel>
          <FieldDescription>Nome ou slug do item PHB.</FieldDescription>
          <Input
            id={`${id}-search`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ex.: espada, kit-de-aventureiro"
            disabled={disabled}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-type`}>Tipo</FieldLabel>
          <select
            id={`${id}-type`}
            className={cn(nativeSelectClassName)}
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            disabled={disabled}
          >
            <option value="">Todos</option>
            {Object.entries(ITEM_TYPE_LABELS_PT).map(([slug, label]) => (
              <option key={slug} value={slug}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <CatalogSelect
        id={id}
        label="Item"
        description={
          itemsQuery.isPending
            ? "Carregando catálogo…"
            : `${options.length} opção(ões) — ${itemsQuery.data?.meta.total ?? 0} no catálogo`
        }
        options={options}
        isLoading={itemsQuery.isPending}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />

      {selected ? (
        <p className="text-xs text-muted-foreground">
          {ITEM_TYPE_LABELS_PT[selected.itemType] ?? selected.itemType}
          {selected.costText ? ` · ${selected.costText}` : null}
          {selected.weight ? ` · ${selected.weight}` : null}
        </p>
      ) : null}

      {itemsQuery.isError ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível carregar o catálogo de itens.
        </p>
      ) : null}
    </div>
  );
}

function formatItemOptionLabel(item: ItemSummary): string {
  const type = ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;
  return `${item.name} (${type})`;
}
