import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

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
  ],
};

export const WEAPON_CATEGORY_FILTER: CatalogFilterField = {
  key: "category",
  label: "Categoria",
  options: [
    { value: "simple", label: "Simples" },
    { value: "martial", label: "Marcial" },
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
