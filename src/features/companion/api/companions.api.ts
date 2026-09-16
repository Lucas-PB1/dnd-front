import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { ActorDetail } from "@/entities/actor/types";
import type { CompanionTracker } from "@/entities/companion/types";

export const companionKeys = {
  all: ["character-companions"] as const,
  list: (characterId: string) =>
    [...companionKeys.all, "list", characterId] as const,
};

export type CharacterCompanionSyncResponse = ActorDetail & {
  reused: boolean;
  templateSlug: string;
  variantLabel: string;
  profileId: string;
};

export type DismissCharacterCompanionPayload = {
  actorId?: string;
};

export type DismissCharacterCompanionResult = {
  dismissedActorId: string;
};

export async function fetchCharacterCompanions(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<CompanionTracker[]>(
    `/characters/${characterId}/companions`,
    accessToken,
  );
}

export async function syncCharacterCompanion(
  accessToken: string,
  characterId: string,
  payload: { restoreHp?: boolean } = {},
) {
  return gameFetch<CharacterCompanionSyncResponse>(
    `/characters/${characterId}/companions/sync`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function dismissCharacterCompanion(
  accessToken: string,
  characterId: string,
  payload: DismissCharacterCompanionPayload = {},
) {
  return gameFetch<DismissCharacterCompanionResult>(
    `/characters/${characterId}/companions/dismiss`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

