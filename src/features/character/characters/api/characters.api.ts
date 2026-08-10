import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CharacterDetail,
  CharacterSummary,
  CoinPurse,
  CreateCharacterPayload,
  UpdateCharacterPayload,
} from "@/entities/character/types";

export type { CharacterSummary, CharacterDetail };

export type PreviewGrantedSpellsPayload = {
  speciesSlug: string;
  level?: number;
  subclassSlug?: string | null;
  speciesChoices?: Array<{ choiceKind: string; choiceSlug: string }>;
  characterFeats?: Array<{ featSlug: string; instanceIndex: number }>;
  featOptions?: Array<{
    featSlug: string;
    instanceIndex?: number;
    optionKey: string;
    valueId: string;
  }>;
  characterSpells?: Array<{
    spellSlug: string;
    listType: "known" | "prepared" | "always_prepared";
  }>;
};

export type PreviewGrantedSpellsResponse = {
  characterSpells: Array<{
    spellSlug: string;
    listType: "known" | "prepared" | "always_prepared";
    source?: "class" | "subclass" | "feat" | "species";
  }>;
  grantedOnly: Array<{
    spellSlug: string;
    listType: "always_prepared";
    source?: "class" | "subclass" | "feat" | "species";
  }>;
};

export const charactersKeys = {
  all: ["characters"] as const,
  detail: (id: string) => [...charactersKeys.all, "detail", id] as const,
  grantedPreview: (payload: PreviewGrantedSpellsPayload) =>
    [...charactersKeys.all, "granted-preview", payload] as const,
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

export async function patchCharacterWealth(
  accessToken: string,
  id: string,
  payload: { coins: Partial<CoinPurse> },
) {
  return gameFetch<CoinPurse>(`/characters/${id}/wealth`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCharacter(accessToken: string, id: string) {
  return gameFetch<void>(`/characters/${id}`, accessToken, {
    method: "DELETE",
  });
}

export async function previewGrantedSpells(
  accessToken: string,
  payload: PreviewGrantedSpellsPayload,
) {
  return gameFetch<PreviewGrantedSpellsResponse>(
    "/characters/granted-spells/preview",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
