import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha WeaponResponseDto */
export type WeaponProperties = {
  propertyIds?: string[];
  masteryId?: string;
  range?: { normal?: number; max?: number };
  [key: string]: unknown;
};

export type WeaponSummary = {
  slug: string;
  name: string;
  category: string;
  damage: string | null;
  damageType: string | null;
  cost: Record<string, unknown> | null;
  weight: string | null;
  properties: WeaponProperties | null;
};

export type WeaponListResponse = PaginatedResponse<WeaponSummary>;

export const WEAPON_CATEGORY_LABELS_PT: Record<string, string> = {
  simple: "Arma Simples",
  martial: "Arma Marcial",
};
