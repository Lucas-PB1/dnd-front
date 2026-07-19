import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type WeaponTrait = {
  slug: string;
  name: string;
  description: string;
};

export type WeaponProperties = {
  propertyIds?: string[];
  masteryId?: string;
  versatileDamage?: string;
  range?: { normal?: number; max?: number };
  [key: string]: unknown;
};

/** Espelha WeaponResponseDto */
export type WeaponSummary = {
  slug: string;
  name: string;
  category: string;
  damage: string | null;
  damageType: string | null;
  versatileDamage: string | null;
  cost: Record<string, unknown> | null;
  weight: string | null;
  properties: WeaponProperties | null;
  propertyDetails: WeaponTrait[];
  mastery: WeaponTrait | null;
};

export type WeaponListResponse = PaginatedResponse<WeaponSummary>;

export const WEAPON_CATEGORY_LABELS_PT: Record<string, string> = {
  simple: "Arma Simples",
  martial: "Arma Marcial",
};
