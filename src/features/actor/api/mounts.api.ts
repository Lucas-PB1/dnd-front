import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { ActorDetail } from "@/entities/actor/types";
import type {
  MountSheetActionPayload,
  MountSheetActionResponse,
} from "@/entities/actor/mount-sheet";

export type CharacterMountLinkResponse = ActorDetail & { reused: boolean };

export type CharacterMountBoardResponse = {
  boardedActorId: string | null;
};

export async function linkCharacterMount(
  accessToken: string,
  characterId: string,
  payload: { itemSlug?: string; templateSlug?: string },
) {
  return gameFetch<CharacterMountLinkResponse>(
    `/characters/${characterId}/mounts/link`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function boardCharacterMount(
  accessToken: string,
  characterId: string,
  payload: { actorId: string | null },
) {
  return gameFetch<CharacterMountBoardResponse>(
    `/characters/${characterId}/mounts/board`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function postMountSheetAction(
  accessToken: string,
  characterId: string,
  payload: MountSheetActionPayload,
) {
  return gameFetch<MountSheetActionResponse>(
    `/characters/${characterId}/mounts/sheet-actions`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
