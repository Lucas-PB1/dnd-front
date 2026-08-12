import {
  ITEM_TYPE_LABELS_PT,
  type ItemSummary,
} from "@/entities/item/types";
import type { ArmorSummary } from "@/entities/armor/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  armorListQuickHint,
  resolveCatalogCostText,
  resolveCatalogWeightText,
  weaponListQuickHint,
} from "@/features/catalog/item-catalog/lib/item-catalog-equipment-stats";
import { weaponCategoryLabel } from "@/features/catalog/equipment-catalog/lib/weapon-labels";
import { editionShortLabel } from "@/entities/edition/catalog-sources";

export type ItemCatalogStat = { label: string; value: string };

export type ItemCatalogBadgeTone =
  | "default"
  | "magic"
  | "coverage"
  | "warn"
  | "muted";

export type ItemCatalogBadge = {
  key: string;
  label: string;
  tone?: ItemCatalogBadgeTone;
};

export function itemCatalogTypeLabel(item: Pick<ItemSummary, "itemType">): string {
  return ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;
}

function isMagicItem(
  item: Pick<ItemSummary, "properties" | "magic">,
): boolean {
  return item.properties?.magic === true || item.magic === true;
}

function isCoverageKind(
  item: Pick<ItemSummary, "kind" | "properties">,
): boolean {
  return item.kind === "coverage" || item.properties?.kind === "coverage";
}

/** Chips para listagem da loja (tipo, preço, mágico, cobertura…). */
export function itemCatalogShopBadges(
  item: Pick<
    ItemSummary,
    "itemType" | "costText" | "weight" | "kind" | "consumable" | "properties" | "magic"
  >,
  equipment?: {
    weapon?: WeaponSummary | null;
    armor?: ArmorSummary | null;
  },
): ItemCatalogBadge[] {
  const props = item.properties;
  const equipmentCategory =
    equipment?.armor?.categoryName ??
    (equipment?.weapon
      ? weaponCategoryLabel(equipment.weapon.category)
      : null);
  const typeLabel = itemCatalogTypeLabel(item);
  const category =
    equipmentCategory ??
    (typeof props?.category === "string" ? props.category.trim() : null);
  const costText = resolveCatalogCostText(item, equipment);
  const weight = resolveCatalogWeightText(item, equipment);
  const rarityLabel =
    typeof props?.rarityLabel === "string" ? props.rarityLabel.trim() : null;
  const editionSlug =
    typeof props?.editionSlug === "string" ? props.editionSlug : null;
  const magic = isMagicItem(item);
  const coverage = isCoverageKind(item);

  const badges: ItemCatalogBadge[] = [
    {
      key: "type",
      label:
        item.kind === "service"
          ? "Serviço"
          : item.consumable
            ? "Consumível"
            : category ?? typeLabel,
    },
    {
      key: "cost",
      label: costText ?? "sem preço",
      tone: costText ? "default" : "muted",
    },
  ];

  if (weight) {
    badges.push({ key: "weight", label: weight, tone: "muted" });
  }

  if (magic) {
    badges.push({ key: "magic", label: "Mágico", tone: "magic" });
  } else if (
    (item.itemType === "weapon" || item.itemType === "armor") &&
    !coverage
  ) {
    badges.push({ key: "mundane", label: "Mundano", tone: "muted" });
  }

  if (coverage) {
    badges.push({ key: "coverage", label: "Cobertura", tone: "coverage" });
  }

  if (rarityLabel) {
    badges.push({ key: "rarity", label: rarityLabel, tone: "magic" });
  }

  if (props?.requiresAttunement === true) {
    badges.push({ key: "attune", label: "Sintonização", tone: "warn" });
  }

  if (editionSlug) {
    badges.push({
      key: "edition",
      label: editionShortLabel(editionSlug),
      tone: "muted",
    });
  }

  if (item.kind === "service") {
    badges.push({
      key: "service",
      label: "não vai à mochila",
      tone: "muted",
    });
  }

  return badges;
}

/** Dica rápida (CA, dano, aplica em…) antes da descrição. */
export function itemCatalogListQuickHint(
  item: Pick<ItemSummary, "itemType" | "properties">,
  equipment?: {
    weapon?: WeaponSummary | null;
    armor?: ArmorSummary | null;
  },
): string | null {
  const props = item.properties;

  const appliesFilter =
    typeof props?.appliesFilter === "string" ? props.appliesFilter.trim() : null;
  if (appliesFilter) return `Aplica em: ${appliesFilter}`;

  if (equipment?.weapon) {
    return weaponListQuickHint(equipment.weapon);
  }

  if (equipment?.armor) {
    return armorListQuickHint(equipment.armor);
  }

  if (item.itemType === "armor") {
    const ac = props?.acFormula as
      | {
          type?: string;
          base?: number;
          dexMax?: number;
          dexCap?: number | null;
        }
      | undefined;
    if (ac?.type === "dex-plus-base" && typeof ac.base === "number") {
      const dexMax =
        typeof ac.dexMax === "number"
          ? ac.dexMax
          : typeof ac.dexCap === "number"
            ? ac.dexCap
            : null;
      if (dexMax != null) {
        return `CA ${ac.base} + Modificador de Des (máx. ${dexMax})`;
      }
      return `CA ${ac.base} + Modificador de Des`;
    }
    if (ac?.type === "fixed" && typeof ac.base === "number") {
      return `CA ${ac.base}`;
    }
    if (ac?.type === "shield-bonus" && typeof ac.bonus === "number") {
      return `Escudo · Bônus CA +${ac.bonus}`;
    }
  }

  if (item.itemType === "weapon") {
    const range = props?.range as { normal?: number; max?: number } | undefined;
    if (typeof range?.normal === "number") {
      const max =
        typeof range.max === "number" ? range.max : range.normal;
      return `Alcance ${range.normal}/${max} m`;
    }
  }

  return null;
}

/** Linha curta para listas (tipo · preço · raridade …). */
export function itemCatalogMetaLine(
  item: Pick<
    ItemSummary,
    "itemType" | "costText" | "weight" | "kind" | "consumable" | "properties"
  >,
): string {
  const props = item.properties;
  const typeLabel = itemCatalogTypeLabel(item);
  const category =
    typeof props?.category === "string" ? props.category.trim() : null;
  const rarityLabel =
    typeof props?.rarityLabel === "string" ? props.rarityLabel.trim() : null;
  const parts = [
    item.kind === "service"
      ? "Serviço"
      : item.consumable
        ? "Consumível"
        : category ?? typeLabel,
    item.costText ?? "sem preço",
    item.weight,
    rarityLabel,
    item.kind === "coverage" ? "cobertura" : null,
    item.kind === "service" ? "não vai à mochila" : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Texto curto para preview na listagem. */
export function itemCatalogTeaser(
  item: Pick<ItemSummary, "description" | "properties">,
): string | null {
  const description = item.description?.trim();
  if (description) return description;
  const header =
    typeof item.properties?.header === "string"
      ? item.properties.header.trim()
      : null;
  return header || null;
}

export function itemCatalogStats(item: ItemSummary): ItemCatalogStat[] {
  const props = item.properties ?? null;
  const typeLabel = itemCatalogTypeLabel(item);
  const category =
    typeof props?.category === "string" ? props.category.trim() : null;
  const rarityLabel =
    typeof props?.rarityLabel === "string" ? props.rarityLabel.trim() : null;
  const attunement =
    typeof props?.attunement === "string"
      ? props.attunement
      : props?.requiresAttunement === true
        ? "Requer sintonização"
        : null;
  const appliesFilter =
    typeof props?.appliesFilter === "string" ? props.appliesFilter.trim() : null;

  const stats: ItemCatalogStat[] = [
    { label: "Tipo", value: category ?? typeLabel },
  ];
  if (props?.magic === true) stats.push({ label: "Mágico", value: "Sim" });
  if (rarityLabel) stats.push({ label: "Raridade", value: rarityLabel });
  if (attunement) stats.push({ label: "Sintonização", value: attunement });
  if (item.consumable) stats.push({ label: "Consumível", value: "Sim" });
  if (item.costText) stats.push({ label: "Custo", value: item.costText });
  if (item.weight) stats.push({ label: "Peso", value: item.weight });
  if (appliesFilter) stats.push({ label: "Aplica em", value: appliesFilter });

  const attribute = props?.attribute;
  if (typeof attribute === "string" && attribute.trim()) {
    stats.push({ label: "Atributo", value: attribute.toUpperCase() });
  }

  return stats;
}
