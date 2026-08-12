import type { ItemSummary } from "@/entities/item/types";
import type { InventoryItem } from "@/entities/character/session-types";

export type ParsedCoverage = {
  appliesTo: string;
  appliesFilter: string;
  requiresTierBonus: boolean;
};

export function parseItemCoverageFromSummary(
  item: Pick<ItemSummary, "properties" | "kind">,
): ParsedCoverage | null {
  const props = item.properties;
  const kind = props?.kind ?? item.kind;
  if (kind !== "coverage") return null;
  const appliesTo =
    typeof props?.appliesTo === "string" ? props.appliesTo : "";
  const appliesFilter =
    typeof props?.appliesFilter === "string" ? props.appliesFilter.trim() : "";
  if (!appliesTo || !appliesFilter) return null;
  return {
    appliesTo,
    appliesFilter,
    requiresTierBonus: props?.requiresTierBonus === true,
  };
}

export function isCoverageItem(
  item: Pick<ItemSummary, "properties" | "kind">,
): boolean {
  if (parseItemCoverageFromSummary(item)) return true;
  const kind = item.properties?.kind ?? item.kind;
  return kind === "coverage";
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

const LIGHT_ARMOR_SLUGS = new Set([
  "padded",
  "leather",
  "studded-leather",
]);
const MEDIUM_ARMOR_SLUGS = new Set([
  "hide",
  "chain-shirt",
  "scale-mail",
  "breastplate",
  "half-plate",
]);
const HEAVY_ARMOR_SLUGS = new Set([
  "ring-mail",
  "chain-mail",
  "splint",
  "plate",
]);

function armorWeightClass(slug: string): "light" | "medium" | "heavy" | null {
  if (LIGHT_ARMOR_SLUGS.has(slug)) return "light";
  if (MEDIUM_ARMOR_SLUGS.has(slug)) return "medium";
  if (HEAVY_ARMOR_SLUGS.has(slug)) return "heavy";
  return null;
}

function filterAllowsArmorWeight(filter: string, slug: string): boolean {
  if (!filter.startsWith("qualquer")) return true;
  const weight = armorWeightClass(slug);
  if (!weight) return true;
  const wantsLight = filter.includes("leve");
  const wantsMedium = filter.includes("media");
  const wantsHeavy = filter.includes("pesada");
  if (!wantsLight && !wantsMedium && !wantsHeavy) return true;
  if (weight === "light") return wantsLight;
  if (weight === "medium") return wantsMedium;
  return wantsHeavy;
}

function filterExcludesHide(filter: string, slug: string, text: string): boolean {
  if (!filter.includes("gibao") && !filter.includes("exceto")) return false;
  return slug === "hide" || text.includes("gibao de peles");
}

function haystack(item: Pick<ItemSummary, "slug" | "name" | "properties">): string {
  const subtype =
    typeof item.properties?.armorSubtype === "string"
      ? item.properties.armorSubtype
      : typeof item.properties?.weaponSubtype === "string"
        ? item.properties.weaponSubtype
        : typeof item.properties?.category === "string"
          ? item.properties.category
          : "";
  return normalize(`${item.slug} ${item.name} ${subtype}`);
}

function coverageLabels(
  item: Pick<ItemSummary, "slug" | "name" | "properties">,
): string[] {
  const props = item.properties;
  const labels = [
    item.name,
    typeof props?.weaponSubtype === "string" ? props.weaponSubtype : null,
    typeof props?.armorSubtype === "string" ? props.armorSubtype : null,
    typeof props?.category === "string" ? props.category : null,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => normalize(value));
  return [...new Set(labels)];
}

/** Espelha splitFilterTokens da API (vírgula, ponto-e-vírgula, "ou"). */
function splitAppliesFilterTokens(filter: string): string[] {
  return normalize(filter)
    .split(/\s*(?:,|;|\||\bou\b|\bor\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function matchesAppliesFilterTokens(
  item: Pick<ItemSummary, "slug" | "name" | "properties">,
  filter: string,
): boolean {
  const text = haystack(item);
  const labels = coverageLabels(item);
  return splitAppliesFilterTokens(filter).some((token) => {
    if (!token || token === "qualquer") return false;
    if (text.includes(token)) return true;
    return labels.some(
      (label) =>
        label === token || label.includes(token) || token.includes(label),
    );
  });
}

export function isMagicCatalogItem(
  item: Pick<ItemSummary, "properties" | "magic">,
): boolean {
  return item.properties?.magic === true || item.magic === true;
}

/** Filtro leve para pickers da loja — validação final na API. */
export function catalogItemMatchesCoverage(
  coverage: ParsedCoverage,
  item: ItemSummary,
): boolean {
  if (isCoverageItem(item)) return false;
  if (isMagicCatalogItem(item)) return false;
  const text = haystack(item);

  if (coverage.appliesTo === "weapon") {
    if (item.itemType !== "weapon") return false;
    if (normalize(coverage.appliesFilter).startsWith("qualquer")) return true;
    return matchesAppliesFilterTokens(item, coverage.appliesFilter);
  }

  if (coverage.appliesTo === "armor") {
    if (item.itemType !== "armor") return false;
    if (/escudo|shield/.test(text)) return false;
    const filter = normalize(coverage.appliesFilter);
    if (filterExcludesHide(filter, item.slug, text)) return false;
    if (!filterAllowsArmorWeight(filter, item.slug)) return false;
    if (filter.startsWith("qualquer")) return true;
    return matchesAppliesFilterTokens(item, coverage.appliesFilter);
  }

  if (coverage.appliesTo === "shield") {
    if (item.itemType !== "armor") return false;
    if (/escudo|shield/.test(text)) return true;
    if (item.properties?.armorSubtype === "Escudo") return true;
    return matchesAppliesFilterTokens(item, coverage.appliesFilter);
  }

  if (coverage.appliesTo === "ammunition") {
    return /flecha|virote|municao|arrow|bolt|bullet|needle|agulha|bala/.test(
      text,
    );
  }

  return false;
}

export function inventoryHostMatchesCoverage(
  host: InventoryItem,
  coverage: ParsedCoverage,
): boolean {
  const appliesKind = coverageAppliesToKind(coverage);
  if (!appliesKind) return false;
  if (host.isCoverage) return false;
  if (host.isMagic) return false;
  if (host.attachedCoverageSlug) return false;
  if (appliesKind === "weapon" && host.itemType !== "weapon") return false;
  if (appliesKind === "armor") {
    if (host.itemType !== "armor" || host.equipmentSlot === "shield") {
      return false;
    }
  }
  if (
    appliesKind === "shield" &&
    host.equipmentSlot !== "shield" &&
    !/escudo|shield/i.test(`${host.itemSlug} ${host.itemName}`)
  ) {
    return false;
  }

  return catalogItemMatchesCoverage(coverage, {
    slug: host.itemSlug,
    name: host.itemName,
    itemType: host.itemType,
    costText: host.costText ?? null,
    weight: null,
    description: null,
    properties: null,
  });
}

export function coverageAppliesToKind(
  coverage: ParsedCoverage,
): "weapon" | "armor" | "shield" | null {
  if (
    coverage.appliesTo === "weapon" ||
    coverage.appliesTo === "armor" ||
    coverage.appliesTo === "shield"
  ) {
    return coverage.appliesTo;
  }
  return null;
}

export function baseCatalogItemType(coverage: ParsedCoverage): string | undefined {
  if (coverage.appliesTo === "weapon" || coverage.appliesTo === "ammunition") {
    return "weapon";
  }
  if (coverage.appliesTo === "armor" || coverage.appliesTo === "shield") {
    return "armor";
  }
  return undefined;
}
