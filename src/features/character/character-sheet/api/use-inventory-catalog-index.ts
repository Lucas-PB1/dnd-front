"use client";

import { useMemo } from "react";

import type { ItemSummary } from "@/entities/item/types";
import { useAllItems } from "@/features/catalog/item-catalog/api/use-items";
import { useShopEquipmentIndex } from "@/features/catalog/item-catalog/api/use-shop-equipment-index";

/** Índice slug → item / arma / armadura para tiles e metadados do inventário. */
export function useInventoryCatalogIndex(enabled = true) {
  const equipmentIndex = useShopEquipmentIndex(enabled);
  const itemsQuery = useAllItems(undefined, enabled);

  const itemsBySlug = useMemo(() => {
    const rows = itemsQuery.data?.data;
    if (!rows) return new Map<string, ItemSummary>();
    return new Map(rows.map((row) => [row.slug, row]));
  }, [itemsQuery.data]);

  return {
    itemsBySlug,
    weaponsBySlug: equipmentIndex.weaponsBySlug,
    armorBySlug: equipmentIndex.armorBySlug,
    isPending: equipmentIndex.isPending || itemsQuery.isPending,
  };
}
