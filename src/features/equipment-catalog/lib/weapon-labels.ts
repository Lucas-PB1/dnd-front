import type { WeaponProperties, WeaponSummary } from "@/entities/weapon/types";
import { WEAPON_CATEGORY_LABELS_PT } from "@/entities/weapon/types";

const PROPERTY_LABELS_PT: Record<string, string> = {
  ammunition: "Munição",
  finesse: "Acuidade",
  heavy: "Pesada",
  light: "Leve",
  loading: "Carregamento",
  range: "Alcance",
  reach: "Alcance estendido",
  thrown: "Arremesso",
  "two-handed": "Duas mãos",
  versatile: "Versátil",
};

const MASTERY_LABELS_PT: Record<string, string> = {
  cleave: "Cindir",
  graze: "Raspar",
  nick: "Talho",
  push: "Empurrão",
  sap: "Exaurir",
  slow: "Retardar",
  topple: "Derrubar",
  vex: "Irritar",
};

export function weaponCategoryLabel(category: string) {
  return WEAPON_CATEGORY_LABELS_PT[category] ?? category;
}

export function weaponCostText(weapon: WeaponSummary) {
  const text = weapon.cost?.text;
  return typeof text === "string" ? text : null;
}

export function formatWeaponPropertyId(id: string) {
  return PROPERTY_LABELS_PT[id] ?? id.replace(/-/g, " ");
}

export function formatWeaponMasteryId(id: string) {
  return MASTERY_LABELS_PT[id] ?? id.replace(/-/g, " ");
}

export function weaponPropertyLabels(properties: WeaponProperties | null) {
  const ids = properties?.propertyIds ?? [];
  return ids.map(formatWeaponPropertyId);
}

export function weaponTeaser(weapon: WeaponSummary) {
  const parts: string[] = [];
  if (weapon.damage) {
    parts.push(
      weapon.damageType
        ? `${weapon.damage} ${weapon.damageType}`
        : weapon.damage,
    );
  }
  const props = weaponPropertyLabels(weapon.properties).slice(0, 3);
  if (props.length) parts.push(props.join(", "));
  return parts.join(" · ") || null;
}
