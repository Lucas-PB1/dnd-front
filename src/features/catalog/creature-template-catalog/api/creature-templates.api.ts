import { catalogFetch, gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CreatureTemplateDetail,
  CreatureTemplateListResponse,
} from "@/entities/creature-template/types";
import {
  buildCatalogSearchParams,
  CATALOG_FETCH_INIT,
} from "@/shared/lib/catalog-query";

export const creatureTemplateKeys = {
  all: ["creature-templates"] as const,
  listPage: (params: {
    page: number;
    limit: number;
    q: string;
    editionSlugs?: string;
  }) => [...creatureTemplateKeys.all, "list", "page", params] as const,
  detail: (slug: string) =>
    [...creatureTemplateKeys.all, "detail", slug] as const,
};

export async function fetchCreatureTemplatesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  editionSlugs?: string;
  fields?: "summary";
}) {
  const search = buildCatalogSearchParams({
    page: params?.page,
    limit: params?.limit ?? 50,
    q: params?.q,
    filters: {
      editionSlugs: params?.editionSlugs,
      fields: params?.fields ?? "summary",
    },
  });

  return catalogFetch<CreatureTemplateListResponse>(
    `/creature-templates?${search}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchCreatureTemplateBySlug(slug: string) {
  return catalogFetch<CreatureTemplateDetail>(
    `/creature-templates/${slug}`,
    CATALOG_FETCH_INIT,
  );
}

export async function fetchCharacterActors(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<import("@/entities/actor/types").ActorSummary[]>(
    `/characters/${characterId}/actors`,
    accessToken,
  );
}

export async function spawnActorFromTemplate(
  accessToken: string,
  payload: import("@/entities/actor/types").SpawnActorFromTemplatePayload,
) {
  return gameFetch<import("@/entities/actor/types").ActorDetail>(
    "/actors/spawn-from-template",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchActorById(accessToken: string, id: string) {
  return gameFetch<import("@/entities/actor/types").ActorDetail>(
    `/actors/${id}`,
    accessToken,
  );
}
