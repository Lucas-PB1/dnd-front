import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import { CATALOG_FETCH_INIT } from "@/shared/lib/catalog-query";

export type EldritchInvocation = {
  slug: string;
  name: string;
  description: string;
  minLevel: number;
  requiresPactSlug: string | null;
  requiresInvocationSlug: string | null;
  repeatable: boolean;
  kind: string;
  grantedSpellSlug: string | null;
  sortOrder: number;
};

export async function fetchEldritchInvocations(maxMinLevel?: number) {
  const search = new URLSearchParams();
  if (maxMinLevel != null) search.set("maxMinLevel", String(maxMinLevel));
  const qs = search.toString();
  return catalogFetch<EldritchInvocation[]>(
    `/eldritch-invocations${qs ? `?${qs}` : ""}`,
    CATALOG_FETCH_INIT,
  );
}
