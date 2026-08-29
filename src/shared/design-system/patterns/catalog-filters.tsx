"use client";

import { cn } from "@/shared/lib/utils";
import { SearchableSelect } from "@/shared/design-system/primitives/searchable-select";

export type CatalogFilterOption = {
  value: string;
  label: string;
};

export type CatalogFilterField = {
  key: string;
  label: string;
  options: CatalogFilterOption[];
  /** Rótulo da opção vazia (padrão: Todos). */
  allLabel?: string;
};

type CatalogFiltersProps = {
  fields: CatalogFilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  className?: string;
};

/** Selects compactos para filtros estruturados do catálogo (URL-synced). */
export function CatalogFilters({
  fields,
  values,
  onChange,
  className,
}: CatalogFiltersProps) {
  if (!fields.length) return null;

  return (
    <div
      className={cn("flex flex-wrap items-end gap-3", className)}
      role="group"
      aria-label="Filtros do catálogo"
    >
      {fields.map((field) => {
        const id = `catalog-filter-${field.key}`;
        const value = values[field.key] ?? "";
        return (
          <label key={field.key} className="flex min-w-36 flex-col gap-1">
            <span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
              {field.label}
            </span>
            <SearchableSelect
              id={id}
              value={value}
              className="h-10"
              options={[
                { value: "", label: field.allLabel ?? "Todos" },
                ...field.options,
              ]}
              placeholder={field.allLabel ?? "Todos"}
              onValueChange={(next) => onChange(field.key, next)}
            />
          </label>
        );
      })}
    </div>
  );
}
