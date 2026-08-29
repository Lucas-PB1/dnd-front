"use client";

import { useQuery } from "@tanstack/react-query";

import type { ItemSummary } from "@/entities/item/types";
import { fetchArmorBySlug, armorKeys } from "@/features/catalog/equipment-catalog/api/armor.api";
import { fetchWeaponBySlug, weaponKeys } from "@/features/catalog/equipment-catalog/api/weapons.api";
import { parseBardingBaseArmorSlug } from "@/features/catalog/item-catalog/lib/barding";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

type ItemEquipmentRef = Pick<
  ItemSummary,
  "slug" | "itemType" | "properties" | "kind"
>;

export function useItemEquipmentDetail(
  item: ItemEquipmentRef | null,
  enabled: boolean,
) {
  const slug = item?.slug ?? "";
  const itemType = item?.itemType;
  const baseArmorSlug = item ? parseBardingBaseArmorSlug(item) : null;

  const isWeapon = itemType === "weapon";
  const isArmor = itemType === "armor";
  const isBarding = Boolean(baseArmorSlug);
  const armorSlug = isArmor ? slug : baseArmorSlug ?? "";

  const weapon = useQuery({
    queryKey: weaponKeys.detail(slug),
    queryFn: () => fetchWeaponBySlug(slug),
    enabled: enabled && isWeapon,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  const armor = useQuery({
    queryKey: armorKeys.detail(armorSlug),
    queryFn: () => fetchArmorBySlug(armorSlug),
    enabled: enabled && (isArmor || isBarding) && Boolean(armorSlug),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  return {
    weapon: isWeapon ? weapon.data : undefined,
    armor: isArmor || isBarding ? armor.data : undefined,
    isPending:
      (isWeapon && weapon.isPending) ||
      ((isArmor || isBarding) && armor.isPending),
  };
}
