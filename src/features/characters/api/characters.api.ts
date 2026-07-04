import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CharacterDetail,
  CharacterSummary,
  CreateCharacterPayload,
  UpdateCharacterPayload,
} from "@/entities/character/types";

export type { CharacterSummary, CharacterDetail };

export const charactersKeys = {
  all: ["characters"] as const,
  detail: (id: string) => [...charactersKeys.all, "detail", id] as const,
};

export async function fetchCharacters(accessToken: string) {
  return gameFetch<CharacterSummary[]>("/characters", accessToken);
}

export async function fetchCharacterById(accessToken: string, id: string) {
  return gameFetch<CharacterDetail>(`/characters/${id}`, accessToken);
}

export async function createCharacter(
  accessToken: string,
  payload: CreateCharacterPayload,
) {
  return gameFetch<CharacterDetail>("/characters", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchCharacter(
  accessToken: string,
  id: string,
  payload: UpdateCharacterPayload,
) {
  return gameFetch<CharacterDetail>(`/characters/${id}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCharacter(accessToken: string, id: string) {
  return gameFetch<void>(`/characters/${id}`, accessToken, {
    method: "DELETE",
  });
}
