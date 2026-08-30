import type { ArmorSummary } from "@/entities/armor/types";
import type { ItemSummary } from "@/entities/item/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  catalogKindLabel as formatCatalogKindLabel,
  catalogKindLabelFromItem,
  readEditionSlug,
} from "@/entities/item/lib/catalog-item-properties";
import { resolveShopArmor } from "@/features/catalog/item-catalog/lib/barding";

export type InventoryCatalogTileMeta = {
  catalogKindLabel: string | null;
  editionSlug: string | null;
};

type ResolveInventoryCatalogTileMetaInput = {
  itemSlug: string;
  itemsBySlug?: Map<string, ItemSummary>;
  weaponsBySlug?: Map<string, WeaponSummary>;
  armorBySlug?: Map<string, ArmorSummary>;
};

export function resolveInventoryCatalogTileMeta({
  itemSlug,
  itemsBySlug,
  weaponsBySlug,
  armorBySlug,
}: ResolveInventoryCatalogTileMetaInput): InventoryCatalogTileMeta {
  const catalogItem = itemsBySlug?.get(itemSlug);
  const weapon = weaponsBySlug?.get(itemSlug);
  const armor =
    armorBySlug?.get(itemSlug) ??
    (catalogItem ? resolveShopArmor(catalogItem, armorBySlug) : undefined);

  let kindLabel: string | null = null;
  if (catalogItem) {
    kindLabel = catalogKindLabelFromItem(catalogItem, weapon);
  } else if (weapon?.category === "advanced") {
    kindLabel = formatCatalogKindLabel("advanced-weapon");
  } else if (armor?.editionSlug && armor.categorySlug === "shield") {
    kindLabel = formatCatalogKindLabel("armor-shield");
  }

  const editionSlug = readEditionSlug(
    catalogItem?.properties,
    weapon,
    armor?.editionSlug,
  );

  return { catalogKindLabel: kindLabel, editionSlug };
}
