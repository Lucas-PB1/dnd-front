"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchArmorBySlug, armorKeys } from "@/features/catalog/equipment-catalog/api/armor.api";
import { fetchWeaponBySlug, weaponKeys } from "@/features/catalog/equipment-catalog/api/weapons.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

export function useItemEquipmentDetail(
  slug: string,
  itemType: string | undefined,
  enabled: boolean,
) {
  const isWeapon = itemType === "weapon";
  const isArmor = itemType === "armor";

  const weapon = useQuery({
    queryKey: weaponKeys.detail(slug),
    queryFn: () => fetchWeaponBySlug(slug),
    enabled: enabled && isWeapon,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  const armor = useQuery({
    queryKey: armorKeys.detail(slug),
    queryFn: () => fetchArmorBySlug(slug),
    enabled: enabled && isArmor,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  return {
    weapon: isWeapon ? weapon.data : undefined,
    armor: isArmor ? armor.data : undefined,
    isPending:
      (isWeapon && weapon.isPending) || (isArmor && armor.isPending),
  };
}
