"use client";

import {
  armorKeys,
  fetchArmorBySlug,
  fetchArmorPage,
} from "@/features/equipment-catalog/api/armor.api";
import {
  weaponKeys,
  fetchWeaponBySlug,
  fetchWeaponsPage,
} from "@/features/equipment-catalog/api/weapons.api";
import {
  fetchItems,
  fetchItemBySlug,
  itemKeys,
} from "@/features/item-catalog/api/items.api";
import { EQUIPMENT_GEAR_ITEM_TYPES } from "@/entities/item/types";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

export function useWeaponsCatalog(params: {
  page: number;
  q?: string;
  category?: string;
}) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, category: params.category },
    clearPlaceholderOnFilter: true,
    queryKey: (p) =>
      weaponKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        category: p.category ?? "",
      }),
    queryFn: (p) =>
      fetchWeaponsPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        category: p.category,
      }),
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

export function useArmorCatalog(params: {
  page: number;
  q?: string;
  category?: string;
}) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q, category: params.category },
    clearPlaceholderOnFilter: true,
    queryKey: (p) =>
      armorKeys.listPage({
        page: p.page,
        limit: p.limit,
        q: p.q ?? "",
        category: p.category ?? "",
      }),
    queryFn: (p) =>
      fetchArmorPage({
        page: p.page,
        limit: p.limit,
        q: p.q,
        category: p.category,
      }),
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

export function useGearCatalog(params: {
  page: number;
  q?: string;
  itemType?: string;
}) {
  const itemType = params.itemType?.trim() || EQUIPMENT_GEAR_ITEM_TYPES;

  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q },
    queryKey: (p) =>
      [
        ...itemKeys.all,
        "list",
        "page",
        { page: p.page, limit: p.limit, q: p.q ?? "", itemType },
      ] as const,
    queryFn: (p) =>
      fetchItems({
        page: p.page,
        limit: p.limit,
        q: p.q,
        itemType,
      }),
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
