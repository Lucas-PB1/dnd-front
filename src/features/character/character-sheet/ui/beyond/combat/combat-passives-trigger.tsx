"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { CombatNotesList } from "@/features/character/character-sheet/ui/beyond/combat/combat-notes-list";
import { FeatureDetailDialog } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import { cn } from "@/shared/lib/utils";

type CombatPassivesTriggerProps = {
  notes: string[];
  className?: string;
};

/** Card compacto na coluna esquerda; abre modal com todas as passivas. */
export function CombatPassivesTrigger({
  notes,
  className,
}: CombatPassivesTriggerProps) {
  const [open, setOpen] = useState(false);
  if (notes.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-2.5 py-2 text-left shadow-sm transition-colors",
          "hover:border-primary/35 hover:bg-muted/25",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          className,
        )}
      >
        <BookOpenIcon
          className="size-3.5 shrink-0 text-secondary"
          aria-hidden
        />
        <span className="min-w-0 flex-1 text-[0.7rem] font-semibold tracking-wide text-foreground uppercase">
          Passivas
        </span>
        <span className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[0.65rem] tabular-nums text-muted-foreground">
          {notes.length}
        </span>
      </button>

      <FeatureDetailDialog
        open={open}
        onOpenChange={setOpen}
        title="Passivas de combate"
        subtitle={`${notes.length} lembrete${notes.length === 1 ? "" : "s"}`}
      >
        <CombatNotesList notes={notes} />
      </FeatureDetailDialog>
    </>
  );
}
