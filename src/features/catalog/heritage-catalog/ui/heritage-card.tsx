import { heritageCategoryLabel } from "@/entities/heritage/category-label";
import type { HeritageCompendiumItem } from "@/entities/heritage/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { catalogTeaserFromDescription } from "@/shared/lib/catalog-teaser";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";
import { cn } from "@/shared/lib/utils";

type HeritageCardProps = {
  heritage: HeritageCompendiumItem;
  listPath?: string;
  className?: string;
};

export function HeritageCard({
  heritage,
  listPath,
  className,
}: HeritageCardProps) {
  const eyebrow =
    heritage.tagline ?? heritageCategoryLabel(heritage.category);
  const teaser =
    heritage.summary ?? catalogTeaserFromDescription(heritage.description);

  return (
    <CatalogTileCard
      href={withCatalogReturn(`/heritages/${heritage.slug}`, listPath)}
      title={heritage.name}
      titleExtra={<CatalogEditionChip editionSlug={heritage.editionSlug} />}
      eyebrow={eyebrow}
      teaser={teaser}
      className={cn("h-full", className)}
      meta={
        <>
          <span>{heritage.creatureType}</span>
          <span>{heritage.sizeRule}</span>
          <span>{heritage.speedRule}</span>
        </>
      }
    />
  );
}
