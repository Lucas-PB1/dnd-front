"use client";

import { cn } from "@/shared/lib/utils";

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
      className={cn(
        "flex flex-wrap items-end gap-3",
        className,
      )}
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
            <select
              id={id}
              value={value}
              onChange={(event) => onChange(field.key, event.target.value)}
              className={cn(
                "h-10 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground",
                "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <option value="">{field.allLabel ?? "Todos"}</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
}
