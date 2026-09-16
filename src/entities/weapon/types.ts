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
  imageUrl?: string | null;
  editionSlug?: string | null;
};

export type WeaponListResponse = PaginatedResponse<WeaponSummary>;
