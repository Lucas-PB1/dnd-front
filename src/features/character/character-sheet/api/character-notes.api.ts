import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { CharacterQuickNotes } from "@/entities/character/session-types";

export const characterNotesKeys = {
  all: ["character-notes"] as const,
  detail: (characterId: string) =>
    [...characterNotesKeys.all, characterId] as const,
};

export async function fetchCharacterNotes(
  token: string,
  characterId: string,
): Promise<CharacterQuickNotes> {
  return gameFetch<CharacterQuickNotes>(
    `/characters/${characterId}/notes`,
    token,
  );
}

export async function saveCharacterNotes(
  token: string,
  characterId: string,
  notes: string,
): Promise<CharacterQuickNotes> {
  return gameFetch<CharacterQuickNotes>(
    `/characters/${characterId}/notes`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ notes }),
    },
  );
}
