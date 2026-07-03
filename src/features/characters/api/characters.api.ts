import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { CharacterSummary } from "@/entities/character/types";

export type { CharacterSummary };

export const charactersKeys = {
  all: ["characters"] as const,
};

export async function fetchCharacters(accessToken: string) {
  return gameFetch<CharacterSummary[]>("/characters", accessToken);
}
