"use client";

import { useMemo, useState } from "react";

import { useBackgrounds } from "@/features/background-catalog/api/use-backgrounds";
import { BackgroundCard } from "@/features/background-catalog/ui/background-card";
import { filterByQuery } from "@/shared/lib/filter-by-query";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function BackgroundsGrid() {
  const { data, isPending, isError, error } = useBackgrounds();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterByQuery(data?.data ?? [], query, (item) =>
        [item.name, ...(item.abilityOptionNames ?? [])].join(" "),
      ),
    [data?.data, query],
  );

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedentes…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar antecedentes"}
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum antecedente encontrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar antecedente…"
        resultCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum antecedente corresponde à busca.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((background) => (
            <BackgroundCard key={background.slug} background={background} />
          ))}
        </div>
      )}
    </div>
  );
}
