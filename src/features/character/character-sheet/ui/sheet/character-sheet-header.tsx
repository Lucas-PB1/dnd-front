"use client";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import type { CharacterDetail } from "@/entities/character/types";
import type { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { BeyondRestActions } from "@/features/character/character-sheet/ui/beyond/layout/beyond-ability-row";
import { DeleteCharacterButton } from "@/features/character/character-sheet/ui/sheet/delete-character-button";
import { SheetCombatStrip } from "@/features/character/character-sheet/ui/sheet/sheet-combat-strip";
import { SheetSessionBadges } from "@/features/character/character-sheet/ui/sheet/sheet-session-badges";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { InkFlourish, MarginCorner, SealMark } from "@/shared/ui/brand-marks";
import { buttonVariants } from "@/shared/ui/button";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

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
  return (
    <header className="relative overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--muted)_75%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_16%,transparent),transparent_50%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklch,var(--accent)_10%,transparent),transparent_45%)]"
        aria-hidden
      />
      <MarginCorner className="pointer-events-none absolute top-2 left-2 size-7 sm:size-8" />
      <MarginCorner
        mirror
        className="pointer-events-none absolute right-2 bottom-2 size-7 sm:size-8"
      />

      <div className="relative flex flex-col gap-3 p-4 sm:gap-3.5 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BackLink href="/characters">Minhas fichas</BackLink>
          <div className="flex flex-wrap items-center gap-2">
            <SourceEditionBadge live />
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

        <div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2">
          <SealMark className="size-10 shrink-0 text-secondary sm:size-11" />
          <div className="min-w-0 space-y-1.5">
            <h1 className="font-heading max-w-56 truncate text-2xl font-semibold leading-none tracking-tight sm:max-w-[20rem] sm:text-3xl">
              {character.name}
            </h1>
            <InkFlourish className="h-3 w-32 text-secondary/60 sm:w-40" />
            <SheetSessionBadges characterId={characterId} />
          </div>

          <div
            aria-label="Identidade do personagem"
            className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:justify-end"
          >
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

        <SheetCombatStrip characterId={characterId} character={character} />

        <BeyondRestActions characterId={characterId} />
      </div>
    </header>
  );
}

export function CharacterSheetErrorState({ message }: { message: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-5">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--muted)_75%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4">
        <SealMark className="size-10 text-secondary" />
        <p className="text-sm text-destructive">{message}</p>
        <Link
          href="/characters"
          className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
        >
          Voltar às fichas
        </Link>
      </div>
    </div>
  );
}
