import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import { CATALOG_FETCH_INIT } from "@/shared/lib/catalog-query";

export type MetamagicOption = {
  slug: string;
  name: string;
  description: string;
  cost: number;
  stacksWithOther: boolean;
  sortOrder: number;
};

export async function fetchMetamagics() {
  return catalogFetch<MetamagicOption[]>("/metamagics", CATALOG_FETCH_INIT);
}
