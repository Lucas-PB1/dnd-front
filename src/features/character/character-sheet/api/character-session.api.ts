import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CastSpellPayload,
  CastSpellResult,
  CharacterState,
  GunslingerManeuver,
  PatchCharacterStatePayload,
  RestPayload,
  RestResult,
  UseClassResourcePayload,
  UseClassResourceResult,
  UseManeuverResult,
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

export async function spendClassResource(
  accessToken: string,
  characterId: string,
  payload: UseClassResourcePayload,
) {
  return gameFetch<UseClassResourceResult>(
    `/characters/${characterId}/resources/use`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function listManeuvers(accessToken: string, characterId: string) {
  return gameFetch<GunslingerManeuver[]>(
    `/characters/${characterId}/maneuvers`,
    accessToken,
  );
}

export async function useManeuver(
  accessToken: string,
  characterId: string,
  maneuverSlug: string,
) {
  return gameFetch<UseManeuverResult>(
    `/characters/${characterId}/maneuvers/use`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ maneuverSlug }),
    },
  );
}

export async function reloadFirearm(
  accessToken: string,
  characterId: string,
  itemSlug: string,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/firearms/reload`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ itemSlug }),
    },
  );
}

export async function fireChamber(
  accessToken: string,
  characterId: string,
  itemSlug: string,
  shots = 1,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/firearms/fire`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ itemSlug, shots }),
    },
  );
}

export async function recoverRisk(accessToken: string, characterId: string) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/resources/risk/recover`,
    accessToken,
    { method: "POST", body: "{}" },
  );
}

export async function toggleRage(
  accessToken: string,
  characterId: string,
  active?: boolean,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/rage/toggle`,
    accessToken,
    { method: "POST", body: JSON.stringify(active == null ? {} : { active }) },
  );
}

export async function toggleReckless(
  accessToken: string,
  characterId: string,
  active?: boolean,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/reckless/toggle`,
    accessToken,
    { method: "POST", body: JSON.stringify(active == null ? {} : { active }) },
  );
}

export async function recoverAllRage(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/resources/rage/recover-all`,
    accessToken,
    { method: "POST", body: "{}" },
  );
}
