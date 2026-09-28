import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Resposta de `GET /spells?fields=summary`. */
export type SpellCatalogLabel = {
  slug: string;
  name: string;
  level: number;
  schoolSlug: string;
  schoolName: string;
  ritual: boolean;
};

export type SpellCatalogLabelListResponse = PaginatedResponse<SpellCatalogLabel>;

export type SpellSummary = {
  slug: string;
  name: string;
  level: number;
  levelLabel: string;
  schoolSlug: string;
  schoolName: string;
  castingTime: string;
  range: string;
  hasVerbal: boolean;
  hasSomatic: boolean;
  hasMaterial: boolean;
  materialDescription: string | null;
  componentsLabel: string | null;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels: string | null;
  sourceChapter: number | null;
  editionSlug: string | null;
  saveAbilitySlug: string | null;
  requiresAttackRoll: boolean;
};

export type SpellListResponse = PaginatedResponse<SpellSummary>;

export type SpellSpiritVariant = {
  variantKey: string;
  label: string;
  templateSlug: string;
  /** Animar Objetos: 1/2/3 por tamanho; invocações comuns = 1. */
  budgetCost: number;
};

export type SpellSpiritVariants = {
  spellSlug: string;
  variants: SpellSpiritVariant[];
};
