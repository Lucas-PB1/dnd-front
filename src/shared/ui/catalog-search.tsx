"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

type CatalogSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  className?: string;
};

export function CatalogSearch({
  value,
  onChange,
  placeholder = "Buscar…",
  resultCount,
  className,
}: CatalogSearchProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">{placeholder}</span>
        <MagnifyingGlassIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 pl-9"
        />
      </label>
      {typeof resultCount === "number" ? (
        <p className="shrink-0 text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </p>
      ) : null}
    </div>
  );
}
