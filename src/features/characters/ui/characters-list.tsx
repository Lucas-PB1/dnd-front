"use client";

import Link from "next/link";

import { useCharacters } from "@/features/characters/api/use-characters";

export function CharactersList() {
  const { data, isPending, isError, error } = useCharacters();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando fichas…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar fichas"}
      </p>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma ficha ainda.{" "}
        <Link
          href="/characters/new"
          className="text-primary underline-offset-4 hover:underline"
        >
          Criar primeira ficha
        </Link>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {data.map((character) => (
        <li key={character.id}>
          <Link
            href={`/characters/${character.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0 text-left">
              <p className="font-medium">{character.name}</p>
              <p className="text-sm text-muted-foreground">
                Nv. {character.level} · {character.speciesSlug} ·{" "}
                {character.classSlug}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              Ver →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
