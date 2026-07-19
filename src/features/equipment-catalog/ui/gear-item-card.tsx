import type { ItemSummary } from "@/entities/item/types";
import { ITEM_TYPE_LABELS_PT } from "@/entities/item/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { stripCatalogWikiLinks } from "@/shared/lib/strip-catalog-wiki-links";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type GearItemCardProps = {
  item: ItemSummary;
  listPath?: string;
  className?: string;
};

export function GearItemCard({ item, listPath, className }: GearItemCardProps) {
  const typeLabel = ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;

  return (
    <CatalogListCard
      href={withCatalogReturn(`/equipment/items/${item.slug}`, listPath)}
      title={item.name}
      eyebrow={typeLabel}
      teaser={
        item.description ? stripCatalogWikiLinks(item.description) : null
      }
      aside={
        <div className="shrink-0 space-y-0.5 text-xs text-muted-foreground sm:max-w-40 sm:text-right">
          {item.costText ? <p>{item.costText}</p> : null}
          {item.weight ? <p>{item.weight}</p> : null}
        </div>
      }
      className={className}
    />
  );
}
