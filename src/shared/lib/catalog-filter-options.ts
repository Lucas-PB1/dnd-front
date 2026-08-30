import type { AbilitySummary } from "@/entities/ability/types";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export function buildAbilityFilter(
  abilities: readonly AbilitySummary[],
): CatalogFilterField {
  return {
    key: "ability",
    label: "Atributo",
    options: [...abilities]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((ability) => ({ value: ability.slug, label: ability.name })),
  };
}

export const RARE_FILTER: CatalogFilterField = {
  key: "rare",
  label: "Raridade",
  options: [
    { value: "true", label: "Raros" },
    { value: "false", label: "Comuns" },
  ],
};

export const SPELL_LEVEL_FILTER: CatalogFilterField = {
  key: "level",
  label: "Círculo",
  options: [
    { value: "0", label: "Truque" },
    { value: "1", label: "1º" },
    { value: "2", label: "2º" },
    { value: "3", label: "3º" },
    { value: "4", label: "4º" },
    { value: "5", label: "5º" },
    { value: "6", label: "6º" },
    { value: "7", label: "7º" },
    { value: "8", label: "8º" },
    { value: "9", label: "9º" },
  ],
};

export const SPELL_SCHOOL_FILTER: CatalogFilterField = {
  key: "school",
  label: "Escola",
  options: [
    { value: "abjuracao", label: "Abjuração" },
    { value: "adivinhacao", label: "Adivinhação" },
    { value: "encantamento", label: "Encantamento" },
    { value: "evocacao", label: "Evocação" },
    { value: "ilusao", label: "Ilusão" },
    { value: "invocacao", label: "Invocação" },
    { value: "necromancia", label: "Necromancia" },
    { value: "transmutacao", label: "Transmutação" },
  ],
};

export const FEAT_CATEGORY_FILTER: CatalogFilterField = {
  key: "category",
  label: "Categoria",
  options: [
    { value: "origin", label: "Origem" },
    { value: "general", label: "Geral" },
    { value: "fighting-style", label: "Estilo de Luta" },
    { value: "epic-boon", label: "Dádiva Épica" },
    { value: "gh-transformation", label: "Transformação GH" },
  ],
};

export const WEAPON_CATEGORY_FILTER: CatalogFilterField = {
  key: "category",
  label: "Categoria",
  options: [
    { value: "simple", label: "Simples" },
    { value: "martial", label: "Marcial" },
    { value: "advanced", label: "Avançada" },
  ],
};

export const ARMOR_CATEGORY_FILTER: CatalogFilterField = {
  key: "category",
  label: "Categoria",
  options: [
    { value: "light", label: "Leve" },
    { value: "medium", label: "Média" },
    { value: "heavy", label: "Pesada" },
    { value: "shield", label: "Escudo" },
  ],
};

export const ITEM_TYPE_FILTER: CatalogFilterField = {
  key: "itemType",
  label: "Tipo",
  options: [
    { value: "gear", label: "Equipamento" },
    { value: "tool", label: "Ferramenta" },
    { value: "focus", label: "Foco" },
    { value: "other", label: "Outro" },
  ],
};

/** Filtro de tipo avançado GH no grid de equipamento do compêndio. */
export const GEAR_CATALOG_KIND_FILTER: CatalogFilterField = {
  key: "catalogKind",
  label: "Tipo avançado",
  options: [
    { value: "ammunition", label: "Munição avançada" },
    { value: "weapon-like-gear", label: "Equipamento (arma)" },
    { value: "armor-upgrade", label: "Melhoria de armadura" },
    { value: "spellcasting-focus", label: "Foco de conjuração" },
    { value: "tool-instrument-upgrade", label: "Melhoria de instrumento" },
    { value: "prosthetic", label: "Prótese" },
    { value: "poison", label: "Veneno" },
  ],
};

export const MAGIC_ITEM_RARITY_FILTER: CatalogFilterField = {
  key: "rarity",
  label: "Raridade",
  options: [
    { value: "common", label: "Comum" },
    { value: "uncommon", label: "Incomum" },
    { value: "rare", label: "Raro" },
    { value: "very-rare", label: "Muito raro" },
    { value: "legendary", label: "Lendário" },
    { value: "artifact", label: "Artefato" },
    { value: "varies", label: "Variável" },
  ],
};

/** Tipos na aba Itens mágicos (compõe com raridade + Fontes). */
export const MAGIC_ITEM_TYPE_FILTER: CatalogFilterField = {
  key: "itemType",
  label: "Tipo",
  options: [
    { value: "weapon", label: "Arma" },
    { value: "armor", label: "Armadura" },
    { value: "gear", label: "Equipamento" },
    { value: "other", label: "Outro / anel / etc." },
  ],
};
