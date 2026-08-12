import { shortSpeciesSize } from "@/entities/species/short-size";
import type { SpeciesSummary } from "@/entities/species/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";

type SpeciesCardProps = {
  species: SpeciesSummary;
  listPath?: string;
  className?: string;
  /** Nome da espécie-base (quando `variantOf` e a base está na lista). */
  variantBaseName?: string | null;
};

export function SpeciesCard({
  species,
  listPath,
  className,
  variantBaseName,
}: SpeciesCardProps) {
  const variantHint = species.variantOf
    ? `Variante de ${variantBaseName ?? species.variantOf}`
    : null;
  const eyebrow = [species.tagline, variantHint].filter(Boolean).join(" · ") || null;

  return (
    <CatalogTileCard
      href={withCatalogReturn(`/species/${species.slug}`, listPath)}
      title={species.name}
      titleExtra={<CatalogEditionChip editionSlug={species.editionSlug} />}
      eyebrow={eyebrow}
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
