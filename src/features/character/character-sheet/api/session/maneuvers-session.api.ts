import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { GunslingerManeuver } from "@/entities/character/session-types";

export type BattleMasterManeuver = {
  slug: string;
  name: string;
  description: string;
  timing: string;
  addsToDamage: boolean;
  addsToAttack: boolean;
};

export async function listManeuvers(accessToken: string, characterId: string) {
  return gameFetch<GunslingerManeuver[]>(
    `/characters/${characterId}/maneuvers`,
    accessToken,
  );
}

export async function listBattleMasterManeuvers(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<BattleMasterManeuver[]>(
    `/characters/${characterId}/fighter/maneuvers`,
    accessToken,
  );
}
