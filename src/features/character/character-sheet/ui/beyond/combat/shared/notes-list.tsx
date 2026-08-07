"use client";

import { cn } from "@/shared/lib/utils";

type CombatNotesListProps = {
  notes: string[];
  className?: string;
};

/**
 * Renders combat notes as clean, visually separated cards.
 * Each note is displayed in a subtle bordered card with an
 * indicator pip for scanability during gameplay.
 */
export function CombatNotesList({ notes, className }: CombatNotesListProps) {
  if (!notes.length) return null;

  return (
    <ul className={cn("space-y-1.5", className)}>
      {notes.map((note) => (
        <li
          key={note}
          className="flex items-start gap-2 rounded-md border border-border/40 bg-muted/20 px-2.5 py-1.5 text-[0.7rem] text-muted-foreground leading-relaxed"
        >
          <span
            className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary/50"
            aria-hidden
          />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  );
}
