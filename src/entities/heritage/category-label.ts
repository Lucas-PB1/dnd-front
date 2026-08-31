import type { HeritageCategory } from "@/entities/heritage/types";

const HERITAGE_CATEGORY_LABEL: Record<HeritageCategory, string> = {
  common: "Comum",
  rare: "Rara",
  eldritch: "Eldritch",
};

export function heritageCategoryLabel(
  category: HeritageCategory | string | null | undefined,
): string {
  if (!category) return "—";
  return HERITAGE_CATEGORY_LABEL[category as HeritageCategory] ?? category;
}
