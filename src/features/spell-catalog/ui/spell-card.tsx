import Link from "next/link";

import type { SpellSummary } from "@/entities/spell/types";
import { cn } from "@/shared/lib/utils";

type SpellCardProps = {
  spell: SpellSummary;
  className?: string;
};

export function SpellCard({ spell, className }: SpellCardProps) {
  return (
    <Link
      href={`/spells/${spell.slug}`}
      className={cn(
        "group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring hover:bg-muted/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight group-hover:text-primary">
          {spell.name}
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">
          {spell.levelLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{spell.schoolName}</p>
    </Link>
  );
}
