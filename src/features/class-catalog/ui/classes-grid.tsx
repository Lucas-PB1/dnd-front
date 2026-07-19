"use client";

import { useMemo, useState } from "react";

import { useClasses } from "@/features/class-catalog/api/use-classes";
import { ClassCard } from "@/features/class-catalog/ui/class-card";
import { filterByQuery } from "@/shared/lib/filter-by-query";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function ClassesGrid() {
  const { data, isPending, isError, error } = useClasses();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterByQuery(data?.data ?? [], query, (item) =>
        [item.name, item.hitDie, item.primaryAbilityLabel]
          .filter(Boolean)
          .join(" "),
      ),
    [data?.data, query],
  );

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando classes…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar classes"}
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma classe encontrada na API.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar classe…"
        resultCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma classe corresponde à busca.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((classItem) => (
            <ClassCard key={classItem.slug} classItem={classItem} />
          ))}
        </div>
      )}
    </div>
  );
}
