import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha SubclassResponseDto da dnd-api */
export type SubclassSummary = {
  slug: string;
  name: string;
  classSlug: string;
  className: string;
  tagline: string | null;
  summary: string | null;
  sourceChapter: number | null;
  editionSlug: string | null;
  spellSourceSlug: string | null;
  spellSourceLabel: string | null;
};

export type SubclassListResponse = PaginatedResponse<SubclassSummary>;

/** Espelha SubclassMechanicResponseDto da dnd-api */
export type SubclassMechanic = {
  classSlug: string;
  featureLevel: number;
  featureName: string;
  featureDescription: string;
  featureKind: string | null;
  optionKey: string | null;
  resourceSlug: string | null;
  resourceName: string | null;
  resourceUnlockLevel: number | null;
  maxFormula: string | null;
  fixedMax: number | null;
};

export type SubclassMechanicListResponse = PaginatedResponse<SubclassMechanic>;
