import type { ArmorSummary } from "@/entities/armor/types";
import type { InventoryItem } from "@/entities/character/session-types";
import type { ItemSummary } from "@/entities/item/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import { itemCatalogListQuickHint } from "@/features/catalog/item-catalog/lib/item-catalog-meta";
import { resolveCatalogCostText } from "@/features/catalog/item-catalog/lib/item-catalog-equipment-stats";

export type CoverageBaseOptionParts = {
  label: string;
  hint?: string;
};

function itemSummaryFromHost(host: InventoryItem): Pick<
  ItemSummary,
  "slug" | "name" | "itemType" | "properties"
> {
  return {
    slug: host.itemSlug,
    name: host.itemName,
    itemType: host.itemType,
    properties: null,
  };
}

export function coverageBaseCatalogOptionParts(
  item: Pick<ItemSummary, "slug" | "name" | "itemType" | "costText" | "properties">,
  equipment?: {
    weapon?: WeaponSummary | null;
    armor?: ArmorSummary | null;
  },
): CoverageBaseOptionParts {
  const costText = resolveCatalogCostText(item, equipment);
  const label = costText ? `${item.name} · ${costText}` : item.name;
  const hint = itemCatalogListQuickHint(item, equipment) ?? undefined;
  return hint ? { label, hint } : { label };
}

export function coverageInventoryHostOptionParts(
  host: InventoryItem,
  equipment?: {
    weapon?: WeaponSummary | null;
    armor?: ArmorSummary | null;
  },
): CoverageBaseOptionParts {
  const hint =
    itemCatalogListQuickHint(itemSummaryFromHost(host), equipment) ?? undefined;
  return hint ? { label: host.itemName, hint } : { label: host.itemName };
}

export function coverageBaseCatalogOptionLabel(
  item: Pick<ItemSummary, "slug" | "name" | "itemType" | "costText" | "properties">,
  equipment?: {
    weapon?: WeaponSummary | null;
    armor?: ArmorSummary | null;
  },
): string {
  const { label, hint } = coverageBaseCatalogOptionParts(item, equipment);
  return hint ? `${label} — ${hint}` : label;
}
