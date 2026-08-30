import type { ItemSummary } from "@/entities/item/types";
import type { WeaponSummary } from "@/entities/weapon/types";

export type CatalogItemProperties = Record<string, unknown> | null | undefined;

export type AdvancedRequirement = {
  kind?: string;
  minLevel?: number;
  requiresWeaponProficiency?: boolean;
  featSlugs?: string[];
  notesPt?: string;
};

export function readEditionSlug(
  properties: CatalogItemProperties,
  weapon?: WeaponSummary | null,
  armorEditionSlug?: string | null,
): string | null {
  if (weapon?.editionSlug) return weapon.editionSlug;
  if (armorEditionSlug) return armorEditionSlug;
  const raw = properties?.editionSlug;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export function readCatalogKind(properties: CatalogItemProperties): string | null {
  const raw = properties?.catalogKind;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export function readAdvancedRequirement(
  properties: CatalogItemProperties,
): AdvancedRequirement | null {
  const raw = properties?.advancedRequirement;
  if (!raw || typeof raw !== "object") return null;
  return raw as AdvancedRequirement;
}

const CATALOG_KIND_LABELS_PT: Record<string, string> = {
  "advanced-weapon": "Arma avançada",
  ammunition: "Munição avançada",
  "weapon-like-gear": "Equipamento (arma)",
  "armor-shield": "Escudo avançado",
  "armor-upgrade": "Melhoria de armadura",
  "spellcasting-focus": "Foco de conjuração",
  "tool-instrument-upgrade": "Melhoria de instrumento",
  prosthetic: "Prótese",
  poison: "Veneno",
  "adventuring-gear": "Equipamento",
};

export function catalogKindLabel(catalogKind: string | null | undefined): string | null {
  if (!catalogKind) return null;
  return CATALOG_KIND_LABELS_PT[catalogKind] ?? catalogKind;
}

export function catalogKindLabelFromItem(
  item: Pick<ItemSummary, "properties">,
  weapon?: WeaponSummary | null,
): string | null {
  if (weapon?.category === "advanced") {
    return CATALOG_KIND_LABELS_PT["advanced-weapon"] ?? null;
  }
  return catalogKindLabel(readCatalogKind(item.properties));
}

export function matchesShopWeaponCategory(
  weapon: WeaponSummary | null | undefined,
  categoryFilter: string,
): boolean {
  if (!categoryFilter) return true;
  if (!weapon) return false;
  return weapon.category === categoryFilter;
}

export function matchesShopCatalogKind(
  item: Pick<ItemSummary, "properties">,
  catalogKindFilter: string,
): boolean {
  if (!catalogKindFilter) return true;
  return readCatalogKind(item.properties) === catalogKindFilter;
}
