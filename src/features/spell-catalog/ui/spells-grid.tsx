"use client";

import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { SpellCard } from "@/features/spell-catalog/ui/spell-card";

export function SpellsGrid() {
  const { data, isPending, isError, error } = useSpells();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando magias…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar magias"}
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma magia encontrada.</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {data.data.map((spell) => (
        <SpellCard key={spell.slug} spell={spell} />
      ))}
    </div>
  );
}
