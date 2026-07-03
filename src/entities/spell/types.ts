import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

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
};

export type SpellListResponse = PaginatedResponse<SpellSummary>;
