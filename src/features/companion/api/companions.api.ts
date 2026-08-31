import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { ActorDetail } from "@/entities/actor/types";

export type CharacterCompanionSyncResponse = ActorDetail & {
  reused: boolean;
  templateSlug: string;
  variantLabel: string;
  profileId: string;
};

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
