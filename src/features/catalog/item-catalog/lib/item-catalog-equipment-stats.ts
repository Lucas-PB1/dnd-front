import type { ArmorSummary } from "@/entities/armor/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import type { ItemCatalogStat } from "@/features/catalog/item-catalog/lib/item-catalog-meta";
import {
  weaponCategoryLabel,
  weaponCostText,
  weaponWeightText,
} from "@/features/catalog/equipment-catalog/lib/weapon-labels";

export type ItemCatalogTraitLine = {
  title: string;
  description: string;
};

export function weaponEquipmentStats(weapon: WeaponSummary): ItemCatalogStat[] {
  const stats: ItemCatalogStat[] = [
    { label: "Categoria", value: weaponCategoryLabel(weapon.category) },
  ];

  if (weapon.damage) {
    const dmg = weapon.versatileDamage
      ? `${weapon.damage} (${weapon.versatileDamage} duas mãos)`
      : weapon.damage;
    stats.push({
      label: "Dano",
      value: weapon.damageType ? `${dmg} · ${weapon.damageType}` : dmg,
    });
  }

  const range = weapon.range;
  if (range?.normal != null) {
    const rangeText =
      range.max != null
        ? `${range.normal}/${range.max} m`
        : `${range.normal} m`;
    stats.push({ label: "Alcance", value: rangeText });
  }

  const cost = weaponCostText(weapon);
  if (cost) stats.push({ label: "Custo", value: cost });

  const weight = weaponWeightText(weapon);
  if (weight) stats.push({ label: "Peso", value: weight });

  const propertyNames = (weapon.propertyDetails ?? [])
    .map((row) => row.name)
    .filter(Boolean);
  if (propertyNames.length > 0) {
    stats.push({ label: "Propriedades", value: propertyNames.join(", ") });
  }

  if (weapon.mastery?.name) {
    stats.push({ label: "Maestria", value: weapon.mastery.name });
  }

  return stats;
}

export function armorEquipmentStats(armor: ArmorSummary): ItemCatalogStat[] {
  const stats: ItemCatalogStat[] = [
    { label: "Categoria", value: armor.categoryName },
  ];

  const ac =
    armor.acFormula ?? (armor.acBase != null ? String(armor.acBase) : null);
  if (ac) stats.push({ label: "CA", value: ac });

  if (armor.costText) stats.push({ label: "Custo", value: armor.costText });
  if (armor.weight) stats.push({ label: "Peso", value: armor.weight });

  if (armor.strengthReq != null) {
    stats.push({ label: "Força mín.", value: `${armor.strengthReq}+` });
  }

  stats.push({
    label: "Furtividade",
    value: armor.stealthDisadvantage ? "Desvantagem" : "Normal",
  });

  if (armor.donDoff) {
    stats.push({ label: "Vestir / tirar", value: armor.donDoff });
  }

  return stats;
}

export function weaponTraitLines(weapon: WeaponSummary): ItemCatalogTraitLine[] {
  const lines: ItemCatalogTraitLine[] = (weapon.propertyDetails ?? []).map(
    (prop) => ({
      title: prop.name,
      description: prop.description,
    }),
  );
  if (weapon.mastery) {
    lines.push({
      title: `Maestria: ${weapon.mastery.name}`,
      description: weapon.mastery.description,
    });
  }
  return lines;
}

/** Linha curta na listagem da loja (dano + alcance). */
export function weaponListQuickHint(
  weapon: Pick<
    WeaponSummary,
    | "damage"
    | "damageType"
    | "versatileDamage"
    | "range"
    | "propertyDetails"
    | "mastery"
  >,
): string | null {
  const parts: string[] = [];

  if (weapon.damage) {
    const dmg = weapon.versatileDamage
      ? `${weapon.damage} (${weapon.versatileDamage} duas mãos)`
      : weapon.damage;
    parts.push(
      weapon.damageType ? `Dano ${dmg} · ${weapon.damageType}` : `Dano ${dmg}`,
    );
  }

  const propertyNames = (weapon.propertyDetails ?? [])
    .map((row) => row.name.trim())
    .filter(Boolean);
  if (propertyNames.length > 0) {
    parts.push(propertyNames.join(", "));
  }

  if (weapon.mastery?.name) {
    parts.push(`Maestria ${weapon.mastery.name}`);
  }

  if (weapon.range?.normal != null) {
    const max = weapon.range.max ?? weapon.range.normal;
    parts.push(`Alcance ${weapon.range.normal}/${max} m`);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Linha curta na listagem da loja (CA + modificador). */
export function armorListQuickHint(
  armor: Pick<
    ArmorSummary,
    | "acFormula"
    | "acBase"
    | "strengthReq"
    | "categoryName"
    | "categorySlug"
    | "stealthDisadvantage"
  >,
): string | null {
  const parts: string[] = [];

  if (armor.categoryName) {
    parts.push(armor.categoryName);
  }

  const formula = armor.acFormula?.trim();
  if (formula) {
    parts.push(
      armor.categorySlug === "shield" || formula.startsWith("+")
        ? `Bônus CA ${formula}`
        : `CA ${formula}`,
    );
  } else if (armor.acBase != null) {
    parts.push(`CA ${armor.acBase}`);
  }

  if (armor.strengthReq != null) {
    parts.push(`For ${armor.strengthReq}+`);
  }

  if (armor.stealthDisadvantage) {
    parts.push("Desv. furtividade");
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function resolveCatalogCostText(
  item: { costText?: string | null },
  equipment?: {
    weapon?: WeaponSummary | null;
    armor?: ArmorSummary | null;
  },
): string | null {
  if (item.costText?.trim()) return item.costText.trim();
  if (equipment?.armor?.costText?.trim()) return equipment.armor.costText.trim();
  if (equipment?.weapon) {
    return weaponCostText(equipment.weapon);
  }
  return null;
}

export function resolveCatalogWeightText(
  item: { weight?: string | null },
  equipment?: {
    weapon?: WeaponSummary | null;
    armor?: ArmorSummary | null;
  },
): string | null {
  const weight = item.weight?.trim();
  if (weight && !/^[—–−-]+$/.test(weight)) return weight;
  const armorWeight = equipment?.armor?.weight?.trim();
  if (armorWeight && !/^[—–−-]+$/.test(armorWeight)) return armorWeight;
  if (equipment?.weapon) return weaponWeightText(equipment.weapon);
  return null;
}
