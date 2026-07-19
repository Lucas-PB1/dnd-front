"use client";

import { useMemo, useState } from "react";

import { useSpecies } from "@/features/species-catalog/api/use-species";
import { SpeciesCard } from "@/features/species-catalog/ui/species-card";
import { filterByQuery } from "@/shared/lib/filter-by-query";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function SpeciesGrid() {
  const { data, isPending, isError, error } = useSpecies();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterByQuery(data?.data ?? [], query, (item) =>
        [item.name, item.creatureType, item.size].filter(Boolean).join(" "),
      ),
    [data?.data, query],
  );

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando espécies…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar espécies"}
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma espécie encontrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar espécie…"
        resultCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma espécie corresponde à busca.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((species) => (
            <SpeciesCard key={species.slug} species={species} />
          ))}
        </div>
      )}
    </div>
  );
}
