import type { BackgroundSummary } from "@/entities/background/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type BackgroundCardProps = {
  background: BackgroundSummary;
  listPath?: string;
  className?: string;
};

export function BackgroundCard({
  background,
  listPath,
  className,
}: BackgroundCardProps) {
  return (
    <CatalogListCard
      href={withCatalogReturn(`/backgrounds/${background.slug}`, listPath)}
      title={background.name}
      eyebrow={background.tagline}
      teaser={background.summary}
      aside={
        <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground sm:max-w-64 sm:justify-end">
          {background.originFeatName ? (
            <span>{background.originFeatName}</span>
          ) : null}
          {background.abilityOptionNames?.length ? (
            <span>{background.abilityOptionNames.join(" · ")}</span>
          ) : null}
        </div>
      }
      className={className}
    />
  );
}
