import type { SubclassSummary } from "@/entities/subclass/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type SubclassCardProps = {
  subclass: SubclassSummary;
  listPath?: string;
  className?: string;
};

export function SubclassCard({
  subclass,
  listPath,
  className,
}: SubclassCardProps) {
  return (
    <CatalogListCard
      href={withCatalogReturn(`/subclasses/${subclass.slug}`, listPath)}
      title={subclass.name}
      titleExtra={<CatalogEditionChip editionSlug={subclass.editionSlug} />}
      eyebrow={subclass.tagline}
      teaser={subclass.summary}
      imageUrl={subclass.imageUrl}
      aside={
        <p className="shrink-0 text-xs text-muted-foreground sm:max-w-56 sm:text-right">
          {subclass.className}
        </p>
      }
      className={className}
    />
  );
}
