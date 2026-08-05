"use client";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import type { CharacterDetail } from "@/entities/character/types";
import type { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { BeyondRestActions } from "@/features/character/character-sheet/ui/beyond/layout/beyond-ability-row";
import { DeleteCharacterButton } from "@/features/character/character-sheet/ui/sheet/delete-character-button";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";

type CharacterSheetHeaderProps = {
  characterId: string;
  character: CharacterDetail;
  labels: ReturnType<typeof useCharacterCatalogLabels>;
  onOpenSettings: () => void;
};

export function CharacterSheetHeader({
  characterId,
  character,
  labels,
  onOpenSettings,
}: CharacterSheetHeaderProps) {
  const initial = character.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="rounded-xl border border-border/65 bg-card/70 p-3 shadow-sm backdrop-blur sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <BackLink href="/characters" className="mb-2">
            Minhas fichas
          </BackLink>

          <div className="flex min-w-0 items-start gap-3">
            <div
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/12 font-heading text-xl font-semibold text-primary shadow-inner sm:size-14 sm:text-2xl"
            >
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-heading truncate text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {character.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <SheetChip active>Nv. {character.level}</SheetChip>
                {labels.identity.speciesName ? (
                  <SheetChip>{labels.identity.speciesName}</SheetChip>
                ) : null}
                {labels.identity.className ? (
                  <SheetChip>{labels.identity.className}</SheetChip>
                ) : null}
                {labels.identity.subclassName ? (
                  <SheetChip>{labels.identity.subclassName}</SheetChip>
                ) : null}
                {labels.identity.backgroundName ? (
                  <SheetChip>{labels.identity.backgroundName}</SheetChip>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 xl:items-end">
          <BeyondRestActions characterId={characterId} />
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <button
              type="button"
              onClick={onOpenSettings}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "inline-flex items-center gap-1.5",
              )}
            >
              <Cog6ToothIcon className="size-3.5" aria-hidden />
              Ajustes
            </button>
            <DeleteCharacterButton
              characterId={characterId}
              characterName={character.name}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function CharacterSheetErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/65 bg-card/70 p-4">
      <p className="text-sm text-destructive">{message}</p>
      <Link
        href="/characters"
        className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
      >
        Voltar
      </Link>
    </div>
  );
}
