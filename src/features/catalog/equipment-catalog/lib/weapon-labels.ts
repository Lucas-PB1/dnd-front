import type { WeaponSummary } from "@/entities/weapon/types";
import {
  nameForCatalogSlug,
  type CatalogNamedOption,
} from "@/shared/lib/build-catalog-filter-field";
import { toMetricProse } from "@/shared/lib/metric";

export function weaponCategoryLabel(
  category: string,
  categories?: readonly CatalogNamedOption[],
) {
  return nameForCatalogSlug(category, categories);
}

export function weaponCostText(weapon: WeaponSummary) {
  const text = weapon.cost?.text;
  return typeof text === "string" ? text : null;
}

export function weaponWeightText(weapon: WeaponSummary) {
  const weight = weapon.weight?.trim();
  if (!weight || /^[—–−-]+$/.test(weight)) return null;
  return toMetricProse(weight);
}

export function weaponTeaser(weapon: WeaponSummary) {
  const parts: string[] = [];
  if (weapon.damage) {
    const dmg = weapon.versatileDamage
      ? `${weapon.damage}/${weapon.versatileDamage}`
      : weapon.damage;
    parts.push(weapon.damageType ? `${dmg} ${weapon.damageType}` : dmg);
  }
  const names = (weapon.propertyDetails ?? []).map((p) => p.name).slice(0, 3);
  if (names.length) parts.push(names.join(", "));
  return parts.join(" · ") || null;
}
