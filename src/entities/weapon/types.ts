import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type WeaponTrait = {
  slug: string;
  name: string;
  description: string;
};

export type WeaponRange = {
  normal: number | null;
  max: number | null;
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
  range: WeaponRange | null;
  propertyDetails: WeaponTrait[];
  mastery: WeaponTrait | null;
};

export type WeaponListResponse = PaginatedResponse<WeaponSummary>;

export const WEAPON_CATEGORY_LABELS_PT: Record<string, string> = {
  simple: "Arma Simples",
  martial: "Arma Marcial",
};
