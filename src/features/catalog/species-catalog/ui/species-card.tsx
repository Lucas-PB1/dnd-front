import { shortSpeciesSize } from "@/entities/species/short-size";
import type { SpeciesSummary } from "@/entities/species/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { catalogTeaserFromDescription } from "@/shared/lib/catalog-teaser";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";
import { cn } from "@/shared/lib/utils";

type SpeciesCardProps = {
  species: SpeciesSummary;
  listPath?: string;
  className?: string;
};

export function SpeciesCard({ species, listPath, className }: SpeciesCardProps) {
  const eyebrow = species.tagline || null;
  const teaser =
    species.summary ?? catalogTeaserFromDescription(species.description);

  return (
    <CatalogTileCard
      href={withCatalogReturn(`/species/${species.slug}`, listPath)}
      title={species.name}
      titleExtra={<CatalogEditionChip editionSlug={species.editionSlug} />}
      eyebrow={eyebrow}
      teaser={teaser}
      className={cn("h-full", className)}
      meta={
        <>
          <span>{species.creatureType}</span>
          <span>{shortSpeciesSize(species.size)}</span>
          <span>{species.speed}</span>
        </>
      }
    />
  );
}
