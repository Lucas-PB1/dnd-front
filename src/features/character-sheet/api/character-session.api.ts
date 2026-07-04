import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CastSpellPayload,
  CastSpellResult,
  CharacterState,
  PatchCharacterStatePayload,
  RestPayload,
  RestResult,
} from "@/entities/character/session-types";

export const sessionKeys = {
  all: ["character-session"] as const,
  state: (characterId: string) =>
    [...sessionKeys.all, "state", characterId] as const,
};

export async function fetchCharacterState(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/state`,
    accessToken,
  );
}

export async function patchCharacterState(
  accessToken: string,
  characterId: string,
  payload: PatchCharacterStatePayload,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/state`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function castCharacterSpell(
  accessToken: string,
  characterId: string,
  payload: CastSpellPayload,
) {
  return gameFetch<CastSpellResult>(
    `/characters/${characterId}/spells/cast`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function takeCharacterRest(
  accessToken: string,
  characterId: string,
  payload: RestPayload,
) {
  return gameFetch<RestResult>(`/characters/${characterId}/rest`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
