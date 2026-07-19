"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { useCharacters } from "@/features/characters/api/use-characters";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

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
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-12 text-center">
        <div className="space-y-2">
          <p className="font-heading text-lg font-semibold tracking-tight">
            Ainda sem fichas
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crie seu primeiro personagem do PHB 2024. Depois ele fica aqui para
            editar e usar na mesa.
          </p>
        </div>
        <Link
          href="/characters/new"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Criar personagem
        </Link>
      </div>
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
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              Ver
              <ArrowRightIcon className="size-3.5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
