import { shortSpeciesSize } from "@/entities/species/short-size";
import type { SpeciesSummary } from "@/entities/species/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";

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
    <CatalogTileCard
      href={withCatalogReturn(`/species/${species.slug}`, listPath)}
      title={species.name}
      eyebrow={species.tagline}
      teaser={species.summary}
      meta={
        <>
          <span>{species.creatureType}</span>
          <span>{shortSpeciesSize(species.size)}</span>
          <span>{species.speed}</span>
        </>
      }
      className={className}
    />
  );
}
