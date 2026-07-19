import Link from "next/link";

import type { SpellSummary } from "@/entities/spell/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { cn } from "@/shared/lib/utils";

type SpellCardProps = {
  spell: SpellSummary;
  listPath?: string;
  className?: string;
};

function spellTeaser(description: string): string {
  return description.replace(/\s+/g, " ").trim();
}

export function SpellCard({ spell, listPath, className }: SpellCardProps) {
  const flags = [
    spell.concentration ? "Concentração" : null,
    spell.ritual ? "Ritual" : null,
  ].filter(Boolean);

  return (
    <Link
      href={withCatalogReturn(`/spells/${spell.slug}`, listPath)}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
            {spell.name}
          </h2>
          <span className="font-mono text-xs text-secondary">
            {spell.levelLabel}
          </span>
        </div>
        <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
          {spell.schoolName}
        </p>
        {spell.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {spellTeaser(spell.description)}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground sm:max-w-56 sm:justify-end">
        <span>{spell.castingTime}</span>
        <span>{spell.range}</span>
        {flags.map((flag) => (
          <span key={flag} className="text-primary/90">
            {flag}
          </span>
        ))}
      </div>
    </Link>
  );
}
