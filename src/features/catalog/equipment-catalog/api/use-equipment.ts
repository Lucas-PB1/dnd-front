"use client";

import {
  armorKeys,
  fetchAllArmor,
  fetchArmorBySlug,
} from "@/features/catalog/equipment-catalog/api/armor.api";
import {
  weaponKeys,
  fetchAllWeapons,
  fetchWeaponBySlug,
} from "@/features/catalog/equipment-catalog/api/weapons.api";
import {
  fetchAllItems,
  fetchItemBySlug,
  itemKeys,
} from "@/features/catalog/item-catalog/api/items.api";
import { EQUIPMENT_GEAR_ITEM_TYPES } from "@/entities/item/types";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import { useCatalogDetailQuery } from "@/shared/lib/use-catalog-query";

export function useWeaponsCatalog(params: { q?: string; category?: string }) {
  return useCatalogCompendium({
    queryKey: weaponKeys.all,
    fetchAll: fetchAllWeapons,
    q: params.q,
    filters: { category: params.category },
    editionScoped: false,
  });
}

export function useWeaponDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: weaponKeys.detail(slug),
    queryFn: () => fetchWeaponBySlug(slug),
    enabled,
  });
}

export function useArmorCatalog(params: { q?: string; category?: string }) {
  return useCatalogCompendium({
    queryKey: armorKeys.all,
    fetchAll: fetchAllArmor,
    q: params.q,
    filters: { category: params.category },
    editionScoped: false,
  });
}

export function useArmorDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: armorKeys.detail(slug),
    queryFn: () => fetchArmorBySlug(slug),
    enabled,
  });
}

export function useGearCatalog(params: { q?: string; itemType?: string }) {
  const itemType = params.itemType?.trim() || EQUIPMENT_GEAR_ITEM_TYPES;

  return useCatalogCompendium({
    queryKey: [...itemKeys.all, "gear", itemType] as const,
    fetchAll: (filters) =>
      fetchAllItems({
        q: filters.q,
        itemType,
        magic: false,
        fields: "summary",
      }),
    q: params.q,
    editionScoped: false,
  });
}

export function useMagicItemsCatalog(params: {
  q?: string;
  rarity?: string;
  itemType?: string;
}) {
  return useCatalogCompendium({
    queryKey: [...itemKeys.all, "magic"] as const,
    fetchAll: (filters) =>
      fetchAllItems({
        q: filters.q,
        magic: true,
        rarity: filters.rarity,
        itemType: filters.itemType,
        editionSlugs: filters.editionSlugs,
        fields: "summary",
      }),
    q: params.q,
    filters: {
      rarity: params.rarity,
      itemType: params.itemType,
    },
  });
}

export function useItemDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: itemKeys.detail(slug),
    queryFn: () => fetchItemBySlug(slug),
    enabled,
  });
}
