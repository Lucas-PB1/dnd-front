"use client";

import { PencilSquareIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { CharacterDetail } from "@/entities/character/types";
import type { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { BeyondRestActions } from "@/features/character/character-sheet/ui/beyond/layout/beyond-ability-row";
import { DeleteCharacterButton } from "@/features/character/character-sheet/ui/sheet/delete-character-button";
import type { SheetEditId } from "@/features/character/character-sheet/lib/edit/sheet-edit-types";
import { SheetChip, SheetEditAction } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CharacterSheetHeaderProps = {
  characterId: string;
  character: CharacterDetail;
  labels: ReturnType<typeof useCharacterCatalogLabels>;
  onEditIdentity: () => void;
};

export function CharacterSheetHeader({
  characterId,
  character,
  labels,
  onEditIdentity,
}: CharacterSheetHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-2 border-b border-border/60 pb-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <BackLink href="/characters">Minhas fichas</BackLink>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/12 font-heading text-sm font-semibold text-primary"
          >
            {character.name.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading truncate text-lg font-semibold tracking-tight sm:text-xl">
              {character.name}
            </h1>
            <div className="mt-0.5 flex flex-wrap gap-1">
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
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <BeyondRestActions characterId={characterId} />
        <button
          type="button"
          onClick={onEditIdentity}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex items-center gap-1.5",
          )}
        >
          <UserIcon className="size-3.5" aria-hidden />
          Identidade
        </button>
        <DeleteCharacterButton
          characterId={characterId}
          characterName={character.name}
        />
      </div>
    </header>
  );
}

type SheetEditButtonProps = {
  editId: NonNullable<SheetEditId>;
  label?: string;
  onEdit: (editId: NonNullable<SheetEditId>) => void;
};

export function SheetEditButton({
  editId,
  label = "Editar",
  onEdit,
}: SheetEditButtonProps) {
  return (
    <SheetEditAction onClick={() => onEdit(editId)}>
      <PencilSquareIcon className="size-3" aria-hidden />
      {label}
    </SheetEditAction>
  );
}

export function CharacterSheetErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-destructive">{message}</p>
      <Link
        href="/characters"
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Voltar
      </Link>
    </div>
  );
}
