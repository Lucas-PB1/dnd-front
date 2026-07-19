import Link from "next/link";

import { shortSpeciesSize } from "@/entities/species/short-size";
import type { SpeciesSummary } from "@/entities/species/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { cn } from "@/shared/lib/utils";

type SpeciesCardProps = {
  species: SpeciesSummary;
  listPath?: string;
  className?: string;
};

export function SpeciesCard({
  species,
  listPath,
  className,
}: SpeciesCardProps) {
  return (
    <Link
      href={withCatalogReturn(`/species/${species.slug}`, listPath)}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring hover:bg-muted/30",
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <h2 className="font-heading text-lg font-semibold tracking-tight group-hover:text-primary">
          {species.name}
        </h2>
        {species.tagline ? (
          <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
            {species.tagline}
          </p>
        ) : null}
      </div>

      {species.summary ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {species.summary}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span>{species.creatureType}</span>
        <span>{shortSpeciesSize(species.size)}</span>
        <span>{species.speed}</span>
      </div>
    </Link>
  );
}
