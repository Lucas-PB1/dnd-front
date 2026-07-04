import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { AbilityScores } from "@/entities/character/types";

export type RollAbilitiesMethod = "standard-array" | "roll" | "point-buy";

export type RollAbilitiesPayload = {
  method: RollAbilitiesMethod;
  abilityScores?: AbilityScores;
};

export type RollAbilitiesResult = {
  method: string;
  abilityScores: AbilityScores;
  rawValues?: number[];
};

export const characterBuildKeys = {
  all: ["character-build"] as const,
  rollAbilities: (method: RollAbilitiesMethod) =>
    [...characterBuildKeys.all, "roll-abilities", method] as const,
};

export async function rollAbilities(
  accessToken: string,
  payload: RollAbilitiesPayload,
) {
  return gameFetch<RollAbilitiesResult>(
    "/characters/roll-abilities",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
