import type { ItemSummary } from "@/entities/item/types";
import {
  catalogKindLabel,
  matchesShopCatalogKind,
  readCatalogKind,
} from "@/entities/item/lib/catalog-item-properties";

export function filterGearCatalogItems(
  items: ItemSummary[],
  catalogKind: string,
): ItemSummary[] {
  if (!catalogKind) return items;
  return items.filter((item) => matchesShopCatalogKind(item, catalogKind));
}

export function gearCatalogKindLabel(item: ItemSummary): string | null {
  return catalogKindLabel(readCatalogKind(item.properties));
}
