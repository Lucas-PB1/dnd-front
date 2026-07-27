import { catalogFetch } from "@/shared/api/dnd-api/api-client";

export type Edition = {
  slug: string;
  label: string;
  book: string;
  language: string;
  notes: string | null;
};

export const ACTIVE_EDITION_SLUG = "phb-2024-pt";

export const editionsKeys = {
  all: ["editions"] as const,
};

export async function fetchEditions() {
  return catalogFetch<Edition[]>("/editions");
}
