"use client";

import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/outline";

import { useCharacters } from "@/features/character/characters/api/use-characters";
import { usePrefetchCharacterSheet } from "@/features/character/character-sheet/api/use-prefetch-character-sheet";
import { DeleteCharacterButton } from "@/features/character/character-sheet/ui/sheet/delete-character-button";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { EmptyScrollMark } from "@/shared/ui/brand-marks";
import { buttonVariants } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";

export function CharactersList() {
  const { data, isPending, isError, error } = useCharacters();
  const prefetchSheet = usePrefetchCharacterSheet();

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
      <EmptyState
        icon={<EmptyScrollMark className="size-16" />}
        title="Ainda sem fichas"
        description="Crie seu primeiro personagem do PHB 2024. Depois ele fica aqui para editar e usar na mesa."
        action={
          <Link
            href="/characters/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex items-center gap-2",
              motion.hoverLift,
            )}
          >
            <PlusIcon className="size-4" aria-hidden />
            Criar personagem
          </Link>
        }
      />
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
          onPointerEnter={() => prefetchSheet(character.id)}
          onFocusCapture={() => prefetchSheet(character.id)}
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium">{character.name}</p>
            <p className="text-sm text-muted-foreground">
              {[
                `Nv. ${character.level}`,
                character.speciesName,
                character.className,
                character.subclassName,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {character.campaigns?.length ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Campanhas:{" "}
                {character.campaigns.map((campaign, index) => (
                  <span key={campaign.id}>
                    {index > 0 ? ", " : null}
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      {campaign.name}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
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
              onPointerEnter={() => prefetchSheet(character.id)}
              onFocus={() => prefetchSheet(character.id)}
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
