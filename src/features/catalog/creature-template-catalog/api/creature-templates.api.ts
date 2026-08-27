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

export async function updateActor(
  accessToken: string,
  id: string,
  payload: {
    hitPointsCurrent?: number | null;
    hitPointsMax?: number | null;
    armorClass?: number | null;
    notes?: string | null;
  },
) {
  return gameFetch<import("@/entities/actor/types").ActorDetail>(
    `/actors/${id}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export type ActorStatePatchPayload = {
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  tempHp?: number;
  conditions?: string[];
  concentratingOn?: string | null;
};

export type ActorStateResponse = {
  actorId: string;
  hitPointsCurrent: number | null;
  hitPointsMax: number | null;
  armorClass: number | null;
  tempHp: number;
  conditions: string[];
  concentratingOn: string | null;
  innateSpellUses: Record<string, number>;
};

export async function patchActorState(
  accessToken: string,
  id: string,
  payload: ActorStatePatchPayload,
) {
  return gameFetch<ActorStateResponse>(
    `/actors/${id}/state`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function linkCharacterVehicle(
  accessToken: string,
  characterId: string,
  payload: { itemSlug?: string; templateSlug?: string },
) {
  return gameFetch<
    import("@/entities/actor/types").ActorDetail & { reused: boolean }
  >(`/characters/${characterId}/vehicles/link`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function boardCharacterVehicle(
  accessToken: string,
  characterId: string,
  payload: { actorId: string | null },
) {
  return gameFetch<{ boardedActorId: string | null }>(
    `/characters/${characterId}/vehicles/board`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
