"use client";

import { useSpecies } from "@/features/species-catalog/api/use-species";
import { SpeciesCard } from "@/features/species-catalog/ui/species-card";

export function SpeciesGrid() {
  const { data, isPending, isError, error } = useSpecies();

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
    <div className="grid gap-3 sm:grid-cols-2">
      {data.data.map((species) => (
        <SpeciesCard key={species.slug} species={species} />
      ))}
    </div>
  );
}
