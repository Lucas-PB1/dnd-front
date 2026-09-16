"use client";

import type { ItemSummary } from "@/entities/item/types";
import { nameForCatalogSlug } from "@/shared/lib/build-catalog-filter-field";
import {
  catalogKindLabelFromItem,
  readEditionSlug,
} from "@/entities/item/lib/catalog-item-properties";
import { useItemTypes } from "@/features/catalog/reference-catalog/api/use-catalog-labels";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { stripCatalogWikiLinks } from "@/shared/lib/strip-catalog-wiki-links";
import { toMetricProse } from "@/shared/lib/metric";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
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
  const itemTypes = useItemTypes();
  const typeLabel = nameForCatalogSlug(item.itemType, itemTypes.data);
  const rarityLabel = propString(item.properties, "rarityLabel");
  const category = propString(item.properties, "category");
  const editionSlug = readEditionSlug(item.properties);
  const catalogKindLabel = catalogKindLabelFromItem(item);
  const magic = propBool(item.properties, "magic");
  const requiresAttunement = propBool(item.properties, "requiresAttunement");

  const eyebrowParts = [
    magic ? "Mágico" : null,
    rarityLabel,
    catalogKindLabel,
    category ?? typeLabel,
  ].filter(Boolean);

  return (
    <CatalogListCard
      href={withCatalogReturn(`/equipment/items/${item.slug}`, listPath)}
      title={item.name}
      titleExtra={
        editionSlug ? <CatalogEditionChip editionSlug={editionSlug} /> : undefined
      }
      eyebrow={eyebrowParts.join(" · ")}
      imageUrl={item.imageUrl}
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
