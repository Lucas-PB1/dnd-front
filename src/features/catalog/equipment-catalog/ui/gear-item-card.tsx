import type { ItemSummary } from "@/entities/item/types";
import { ITEM_TYPE_LABELS_PT } from "@/entities/item/types";
import { editionShortLabel } from "@/entities/edition/catalog-sources";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { stripCatalogWikiLinks } from "@/shared/lib/strip-catalog-wiki-links";
import { toMetricProse } from "@/shared/lib/metric";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type GearItemCardProps = {
  item: ItemSummary;
  listPath?: string;
  className?: string;
};

function propString(
  properties: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = properties?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function propBool(
  properties: Record<string, unknown> | null | undefined,
  key: string,
): boolean {
  return properties?.[key] === true;
}

export function GearItemCard({ item, listPath, className }: GearItemCardProps) {
  const typeLabel = ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;
  const rarityLabel = propString(item.properties, "rarityLabel");
  const category = propString(item.properties, "category");
  const editionSlug = propString(item.properties, "editionSlug");
  const magic = propBool(item.properties, "magic");
  const requiresAttunement = propBool(item.properties, "requiresAttunement");

  const eyebrowParts = [
    magic ? "Mágico" : null,
    rarityLabel,
    category ?? typeLabel,
    editionSlug ? editionShortLabel(editionSlug) : null,
  ].filter(Boolean);

  return (
    <CatalogListCard
      href={withCatalogReturn(`/equipment/items/${item.slug}`, listPath)}
      title={item.name}
      eyebrow={eyebrowParts.join(" · ")}
      teaser={
        item.description
          ? toMetricProse(stripCatalogWikiLinks(item.description))
          : null
      }
      aside={
        <div className="shrink-0 space-y-0.5 text-xs text-muted-foreground sm:max-w-40 sm:text-right">
          {requiresAttunement ? <p>Sintonização</p> : null}
          {item.costText ? <p>{item.costText}</p> : null}
          {item.weight ? <p>{toMetricProse(item.weight)}</p> : null}
        </div>
      }
      className={className}
    />
  );
}
