"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { useCharacters } from "@/features/characters/api/use-characters";
import { DeleteCharacterButton } from "@/features/character-sheet/ui/delete-character-button";
import { motion } from "@/shared/lib/motion";
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
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-12 text-center",
          motion.enter,
        )}
      >
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
          className={cn(buttonVariants({ size: "lg" }), motion.hoverLift)}
        >
          Criar personagem
        </Link>
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "divide-y divide-border rounded-xl border border-border",
        motion.stagger,
      )}
    >
      {data.map((character) => (
        <li
          key={character.id}
          className={cn(
            "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
            motion.hoverRow,
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium">{character.name}</p>
            <p className="text-sm text-muted-foreground">
              Nv. {character.level} · {character.speciesSlug} ·{" "}
              {character.classSlug}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <DeleteCharacterButton
              characterId={character.id}
              characterName={character.name}
              stayOnList
            />
            <Link
              href={`/characters/${character.id}`}
              className={cn(
                buttonVariants({ size: "sm" }),
                "inline-flex items-center gap-1",
              )}
            >
              Abrir / editar
              <ArrowRightIcon className="size-3.5" aria-hidden />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
