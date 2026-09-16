import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { WildShapeEligibleList } from "@/entities/character/wild-shape-eligible";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";

export const wildShapeKeys = {
  eligible: (characterId: string) =>
    [...sessionKeys.all, "wild-shape-eligible", characterId] as const,
};

export async function fetchWildShapeEligible(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<WildShapeEligibleList>(
    `/characters/${characterId}/druid/wild-shape/eligible`,
    accessToken,
  );
}
