import type { WeaponSummary } from "@/entities/weapon/types";
import { WEAPON_CATEGORY_LABELS_PT } from "@/entities/weapon/types";

export function weaponCategoryLabel(category: string) {
  return WEAPON_CATEGORY_LABELS_PT[category] ?? category;
}

export function weaponCostText(weapon: WeaponSummary) {
  const text = weapon.cost?.text;
  return typeof text === "string" ? text : null;
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
