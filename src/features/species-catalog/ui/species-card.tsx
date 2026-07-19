import Link from "next/link";

import type { SpeciesSummary } from "@/entities/species/types";
import { cn } from "@/shared/lib/utils";

type SpeciesCardProps = {
  species: SpeciesSummary;
  className?: string;
};

export function SpeciesCard({ species, className }: SpeciesCardProps) {
  return (
    <Link
      href={`/species/${species.slug}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring hover:bg-muted/30",
        className,
      )}
    >
      <h2 className="font-heading text-lg font-semibold tracking-tight group-hover:text-primary">
        {species.name}
      </h2>
      <p className="text-sm text-muted-foreground">
        {species.creatureType} · {species.size} · {species.speed}
      </p>
    </Link>
  );
}
