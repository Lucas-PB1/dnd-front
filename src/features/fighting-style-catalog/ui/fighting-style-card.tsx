import type { FightingStyleSummary } from "@/entities/fighting-style/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type FightingStyleCardProps = {
  style: FightingStyleSummary;
  listPath?: string;
  className?: string;
};

export function FightingStyleCard({
  style,
  listPath,
  className,
}: FightingStyleCardProps) {
  return (
    <CatalogListCard
      href={withCatalogReturn(`/fighting-styles/${style.slug}`, listPath)}
      title={style.name}
      eyebrow="Estilo de luta"
      teaser={style.description}
      className={className}
    />
  );
}
