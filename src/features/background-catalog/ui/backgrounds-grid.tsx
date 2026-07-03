"use client";

import { useBackgrounds } from "@/features/background-catalog/api/use-backgrounds";
import { BackgroundCard } from "@/features/background-catalog/ui/background-card";

export function BackgroundsGrid() {
  const { data, isPending, isError, error } = useBackgrounds();

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
    <div className="grid gap-3 sm:grid-cols-2">
      {data.data.map((background) => (
        <BackgroundCard key={background.slug} background={background} />
      ))}
    </div>
  );
}
