"use client";

import { useQuery } from "@tanstack/react-query";

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
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

export function useWeaponsCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: weaponKeys.listPage({ page, limit, q }),
    queryFn: () => fetchWeaponsPage({ page, limit, q: q || undefined }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useWeaponDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: weaponKeys.detail(slug),
    queryFn: () => fetchWeaponBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useArmorCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: armorKeys.listPage({ page, limit, q }),
    queryFn: () => fetchArmorPage({ page, limit, q: q || undefined }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useArmorDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: armorKeys.detail(slug),
    queryFn: () => fetchArmorBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useGearCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;
  const itemType = EQUIPMENT_GEAR_ITEM_TYPES;

  return useQuery({
    queryKey: [
      ...itemKeys.all,
      "list",
      "page",
      { page, limit, q, itemType },
    ] as const,
    queryFn: () =>
      fetchItems({
        page,
        limit,
        q: q || undefined,
        itemType,
      }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useItemDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: itemKeys.detail(slug),
    queryFn: () => fetchItemBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}
