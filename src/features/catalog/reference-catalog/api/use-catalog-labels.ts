"use client";

import { useQuery } from "@tanstack/react-query";

import {
  catalogLabelKeys,
  fetchArmorCategories,
  fetchFeatCategories,
  fetchItemTypes,
  fetchSpellSchools,
  fetchToolPools,
  fetchWeaponCategories,
} from "@/features/catalog/reference-catalog/api/catalog-labels.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

export function useSpellSchools() {
  return useQuery({
    queryKey: catalogLabelKeys.spellSchools(),
    queryFn: fetchSpellSchools,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useFeatCategories() {
  return useQuery({
    queryKey: catalogLabelKeys.featCategories(),
    queryFn: fetchFeatCategories,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useWeaponCategories() {
  return useQuery({
    queryKey: catalogLabelKeys.weaponCategories(),
    queryFn: fetchWeaponCategories,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useArmorCategories() {
  return useQuery({
    queryKey: catalogLabelKeys.armorCategories(),
    queryFn: fetchArmorCategories,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useItemTypes() {
  return useQuery({
    queryKey: catalogLabelKeys.itemTypes(),
    queryFn: fetchItemTypes,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useToolPools() {
  return useQuery({
    queryKey: catalogLabelKeys.toolPools(),
    queryFn: fetchToolPools,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
