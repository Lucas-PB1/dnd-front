"use client";

import { useQuery } from "@tanstack/react-query";

import type { ArmorSummary } from "@/entities/armor/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  fetchAllArmor,
  armorKeys,
} from "@/features/catalog/equipment-catalog/api/armor.api";
import {
  fetchAllWeapons,
  weaponKeys,
} from "@/features/catalog/equipment-catalog/api/weapons.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

function toSlugMap<T extends { slug: string }>(
  rows: T[] | undefined,
): Map<string, T> | undefined {
  if (!rows) return undefined;
  return new Map(rows.map((row) => [row.slug, row]));
}

/** Índice slug → arma/armadura para dicas na listagem da loja. */
export function useShopEquipmentIndex(enabled: boolean) {
  const weapons = useQuery({
    queryKey: [...weaponKeys.all, "shop-index"],
    queryFn: fetchAllWeapons,
    enabled,
    staleTime: CATALOG_DETAIL_STALE_MS,
    select: (response) => toSlugMap(response.data),
  });

  const armor = useQuery({
    queryKey: [...armorKeys.all, "shop-index"],
    queryFn: fetchAllArmor,
    enabled,
    staleTime: CATALOG_DETAIL_STALE_MS,
    select: (response) => toSlugMap(response.data),
  });

  return {
    weaponsBySlug: weapons.data as Map<string, WeaponSummary> | undefined,
    armorBySlug: armor.data as Map<string, ArmorSummary> | undefined,
    isPending: weapons.isPending || armor.isPending,
  };
}
