import {
  buildCatalogFilterField,
  catalogFilterOptionsFromNamed,
  type CatalogNamedOption,
} from "@/shared/lib/build-catalog-filter-field";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export const ITEM_TYPE_FILTER_OPTIONS: CatalogNamedOption[] = [
  { slug: "gear", name: "Equipamento" },
  { slug: "tool", name: "Ferramenta" },
  { slug: "focus", name: "Foco" },
  { slug: "other", name: "Outro" },
];

export const GEAR_CATALOG_KIND_OPTIONS: CatalogNamedOption[] = [
  { slug: "ammunition", name: "Munição avançada" },
  { slug: "weapon-like-gear", name: "Equipamento (arma)" },
  { slug: "armor-upgrade", name: "Melhoria de armadura" },
  { slug: "spellcasting-focus", name: "Foco de conjuração" },
  { slug: "tool-instrument-upgrade", name: "Melhoria de instrumento" },
  { slug: "prosthetic", name: "Prótese" },
  { slug: "poison", name: "Veneno" },
];

export const MAGIC_ITEM_RARITY_OPTIONS: CatalogNamedOption[] = [
  { slug: "common", name: "Comum" },
  { slug: "uncommon", name: "Incomum" },
  { slug: "rare", name: "Raro" },
  { slug: "very-rare", name: "Muito raro" },
  { slug: "legendary", name: "Lendário" },
  { slug: "artifact", name: "Artefato" },
  { slug: "varies", name: "Variável" },
];

export const MAGIC_ITEM_TYPE_OPTIONS: CatalogNamedOption[] = [
  { slug: "weapon", name: "Arma" },
  { slug: "armor", name: "Armadura" },
  { slug: "gear", name: "Equipamento" },
  { slug: "other", name: "Outro / anel / etc." },
];

export function buildItemTypeFilter(
  types: readonly CatalogNamedOption[] = ITEM_TYPE_FILTER_OPTIONS,
): CatalogFilterField {
  return buildCatalogFilterField(
    "itemType",
    "Tipo",
    catalogFilterOptionsFromNamed(types),
  );
}

export function buildGearCatalogKindFilter(
  kinds: readonly CatalogNamedOption[] = GEAR_CATALOG_KIND_OPTIONS,
): CatalogFilterField {
  return buildCatalogFilterField(
    "catalogKind",
    "Tipo avançado",
    catalogFilterOptionsFromNamed(kinds),
  );
}

export function buildMagicItemRarityFilter(
  rarities: readonly CatalogNamedOption[] = MAGIC_ITEM_RARITY_OPTIONS,
): CatalogFilterField {
  return buildCatalogFilterField(
    "rarity",
    "Raridade",
    catalogFilterOptionsFromNamed(rarities),
  );
}

export function buildMagicItemTypeFilter(
  types: readonly CatalogNamedOption[] = MAGIC_ITEM_TYPE_OPTIONS,
): CatalogFilterField {
  return buildCatalogFilterField(
    "itemType",
    "Tipo",
    catalogFilterOptionsFromNamed(types),
  );
}
