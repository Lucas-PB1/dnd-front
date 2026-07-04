import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { CharacterDetail } from "@/entities/character/types";
import type {
  LevelUpPayload,
  LevelUpPreview,
} from "@/entities/character/session-types";

export const progressionKeys = {
  all: ["character-progression"] as const,
  preview: (characterId: string) =>
    [...progressionKeys.all, "preview", characterId] as const,
};

export async function fetchLevelUpPreview(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<LevelUpPreview>(
    `/characters/${characterId}/level-up/preview`,
    accessToken,
  );
}

export async function applyLevelUp(
  accessToken: string,
  characterId: string,
  payload: LevelUpPayload,
) {
  return gameFetch<CharacterDetail>(
    `/characters/${characterId}/level-up`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
