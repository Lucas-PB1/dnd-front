import type { FeatSummary } from "@/entities/feat/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type FeatCardProps = {
  feat: FeatSummary;
  listPath?: string;
  className?: string;
};

export function FeatCard({ feat, listPath, className }: FeatCardProps) {
  const teaser =
    feat.benefits
      .map((b) => b.name ?? b.description)
      .filter(Boolean)
      .slice(0, 2)
      .join(" · ") || null;

  return (
    <CatalogListCard
      href={withCatalogReturn(`/feats/${feat.slug}`, listPath)}
      title={feat.name}
      titleExtra={
        <span className="inline-flex items-center gap-1.5">
          <CatalogEditionChip editionSlug={feat.editionSlug} />
          {feat.repeatable ? (
            <span className="text-xs text-secondary">Repetível</span>
          ) : null}
        </span>
      }
      eyebrow={feat.categoryTypeLabel || feat.categoryName}
      teaser={teaser}
      aside={
        feat.prerequisite ? (
          <p className="shrink-0 text-xs text-muted-foreground sm:max-w-56 sm:text-right">
            Pré-req.: {feat.prerequisite}
          </p>
        ) : null
      }
      className={className}
    />
  );
}
