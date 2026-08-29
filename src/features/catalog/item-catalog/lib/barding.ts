import type { ArmorSummary } from "@/entities/armor/types";
import type { ItemSummary } from "@/entities/item/types";

export const BARDING_KIND = "barding";

export const BARDING_RULE_PT =
  "Armadura feita para montaria. Qualquer armadura da tabela do PHB pode ser comprada como barding; custo ×4 e peso ×2 da armadura equivalente.";

type BardingItemRef = Pick<ItemSummary, "slug" | "itemType" | "properties" | "kind">;

export function isBardingItem(
  item: Pick<ItemSummary, "kind" | "properties"> | null | undefined,
): boolean {
  if (!item) return false;
  if (item.kind === BARDING_KIND) return true;
  return item.properties?.kind === BARDING_KIND;
}

export function parseBardingBaseArmorSlug(
  item: BardingItemRef | null | undefined,
): string | null {
  if (!item || !isBardingItem(item)) return null;
  const fromProps = item.properties?.baseArmorSlug;
  if (typeof fromProps === "string" && fromProps.trim()) {
    return fromProps.trim();
  }
  if (item.slug.startsWith("barding-")) {
    return item.slug.slice("barding-".length) || null;
  }
  return null;
}

export function resolveShopArmor(
  item: BardingItemRef,
  armorBySlug: Map<string, ArmorSummary> | undefined,
): ArmorSummary | undefined {
  const baseSlug = parseBardingBaseArmorSlug(item);
  if (baseSlug) return armorBySlug?.get(baseSlug);
  if (item.itemType === "armor") return armorBySlug?.get(item.slug);
  return undefined;
}

export function bardingShopTypeLabel(): string {
  return "Armadura de montaria";
}
