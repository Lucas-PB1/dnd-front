import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CharacterThreadBundle,
  CharacterThreadRank,
} from "@/entities/character-thread/types";

export async function attachCharacterThread(
  accessToken: string,
  characterId: string,
  payload: {
    threadSlug: string;
    goalIndex?: number;
    goalText?: string;
  },
) {
  return gameFetch<CharacterThreadBundle>(
    `/characters/${characterId}/thread`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function setCharacterThreadGoal(
  accessToken: string,
  characterId: string,
  payload: { goalIndex?: number | null; goalText?: string | null },
) {
  return gameFetch<CharacterThreadBundle>(
    `/characters/${characterId}/thread/goal`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function reachCharacterThreadMilestone(
  accessToken: string,
  characterId: string,
  payload: { rank: CharacterThreadRank; benefitKeys?: string[] },
) {
  return gameFetch<CharacterThreadBundle>(
    `/characters/${characterId}/thread/milestones`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function completeCharacterThread(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<CharacterThreadBundle>(
    `/characters/${characterId}/thread/complete`,
    accessToken,
    { method: "POST" },
  );
}

export async function abandonCharacterThread(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<CharacterThreadBundle>(
    `/characters/${characterId}/thread/abandon`,
    accessToken,
    { method: "POST" },
  );
}
