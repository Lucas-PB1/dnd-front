"use client";

import { useMemo, useState } from "react";

import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { SpellCard } from "@/features/spell-catalog/ui/spell-card";
import { filterByQuery } from "@/shared/lib/filter-by-query";
import { CatalogSearch } from "@/shared/ui/catalog-search";

export function SpellsGrid() {
  const { data, isPending, isError, error } = useSpells();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      filterByQuery(data?.data ?? [], query, (item) =>
        [item.name, item.levelLabel, item.schoolName].filter(Boolean).join(" "),
      ),
    [data?.data, query],
  );

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
    <div className="flex flex-col gap-4">
      <CatalogSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar magia…"
        resultCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma magia corresponde à busca.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spell) => (
            <SpellCard key={spell.slug} spell={spell} />
          ))}
        </div>
      )}
    </div>
  );
}
