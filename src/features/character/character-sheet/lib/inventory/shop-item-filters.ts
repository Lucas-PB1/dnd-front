import type { ItemSummary } from "@/entities/item/types";
import type { ArmorSummary } from "@/entities/armor/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  matchesShopCatalogKind,
  matchesShopWeaponCategory,
} from "@/entities/item/lib/catalog-item-properties";
import type { ShopAdvancedFilters } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-filter-options";

type ShopEquipmentIndex = {
  weaponsBySlug?: Map<string, WeaponSummary>;
  armorBySlug?: Map<string, ArmorSummary>;
};

export function filterShopCatalogItems(
  items: ItemSummary[],
  filters: Pick<ShopAdvancedFilters, "weaponCategory" | "catalogKind">,
  equipmentIndex: ShopEquipmentIndex,
): ItemSummary[] {
  const { weaponCategory, catalogKind } = filters;
  if (!weaponCategory && !catalogKind) return items;

  return items.filter((item) => {
    const weapon = equipmentIndex.weaponsBySlug?.get(item.slug);

    if (weaponCategory) {
      if (item.itemType === "weapon" || weapon) {
        return matchesShopWeaponCategory(weapon, weaponCategory);
      }
      return false;
    }

    if (catalogKind) {
      return matchesShopCatalogKind(item, catalogKind);
    }

    return true;
  });
}
