"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAllArmor } from "@/features/catalog/equipment-catalog/api/armor.api";
import { fetchAllWeapons } from "@/features/catalog/equipment-catalog/api/weapons.api";
import { fetchAllItems } from "@/features/catalog/item-catalog/api/items.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import type { CatalogLinkEntry } from "@/shared/lib/segment-catalog-text";

/** Índice nome/slug → href para hyperlinks no catálogo de equipamento. */
export function useEquipmentCatalogLinks() {
  const weapons = useQuery({
    queryKey: ["equipment-links", "weapons"],
    queryFn: () => fetchAllWeapons(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
  const armor = useQuery({
    queryKey: ["equipment-links", "armor"],
    queryFn: () => fetchAllArmor(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
  const items = useQuery({
    queryKey: ["equipment-links", "items"],
    queryFn: async () => {
      const all = await fetchAllItems({
        itemType: "gear,tool,focus,other",
      });
      return all.data;
    },
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  const links = useMemo(() => {
    const entries: CatalogLinkEntry[] = [];
    for (const weapon of weapons.data?.data ?? []) {
      entries.push({
        slug: weapon.slug,
        name: weapon.name,
        href: `/equipment/weapons/${weapon.slug}`,
      });
    }
    for (const piece of armor.data?.data ?? []) {
      entries.push({
        slug: piece.slug,
        name: piece.name,
        href: `/equipment/armor/${piece.slug}`,
      });
    }
    for (const item of items.data ?? []) {
      entries.push({
        slug: item.slug,
        name: item.name,
        href: `/equipment/items/${item.slug}`,
      });
    }
    return withPluralNameAliases(entries);
  }, [weapons.data, armor.data, items.data]);

  return {
    links,
    isPending: weapons.isPending || armor.isPending || items.isPending,
  };
}

/** Aliases simples (Tocha → Tochas) para auto-link em listas de kit. */
function withPluralNameAliases(
  entries: CatalogLinkEntry[],
): CatalogLinkEntry[] {
  const extras: CatalogLinkEntry[] = [];
  const seen = new Set(entries.map((entry) => entry.name.toLowerCase()));
  for (const entry of entries) {
    const plural = `${entry.name}s`;
    if (seen.has(plural.toLowerCase())) continue;
    if (!/[aeoáéíóú]$/i.test(entry.name)) continue;
    extras.push({ ...entry, name: plural });
    seen.add(plural.toLowerCase());
  }
  return [...entries, ...extras];
}
