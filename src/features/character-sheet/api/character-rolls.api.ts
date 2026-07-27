import { gameFetch } from "@/shared/api/dnd-api/api-client";

export type AdvantageMode = "normal" | "advantage" | "disadvantage";

export type CharacterRollResult = {
  kind: "attack" | "damage" | "skill" | "saving_throw" | "initiative";
  label: string;
  expression: string;
  total: number;
  modifier: number;
  mode?: AdvantageMode;
  critical?: boolean;
  rolls: number[];
  kept?: number[];
};

export async function rollCharacterAttack(
  accessToken: string,
  characterId: string,
  payload: {
    itemSlug: string;
    mode: "melee" | "ranged";
    advantage?: AdvantageMode;
  },
) {
  return gameFetch<CharacterRollResult>(
    `/characters/${characterId}/rolls/attack`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rollCharacterDamage(
  accessToken: string,
  characterId: string,
  payload: {
    itemSlug: string;
    mode: "melee" | "ranged";
    critical?: boolean;
  },
) {
  return gameFetch<CharacterRollResult>(
    `/characters/${characterId}/rolls/damage`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rollCharacterSkill(
  accessToken: string,
  characterId: string,
  payload: { skillSlug: string; advantage?: AdvantageMode },
) {
  return gameFetch<CharacterRollResult>(
    `/characters/${characterId}/rolls/skill`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rollCharacterSavingThrow(
  accessToken: string,
  characterId: string,
  payload: {
    abilitySlug: string;
    advantage?: AdvantageMode;
  },
) {
  return gameFetch<CharacterRollResult>(
    `/characters/${characterId}/rolls/saving-throw`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rollCharacterInitiative(
  accessToken: string,
  characterId: string,
  payload: { advantage?: AdvantageMode } = {},
) {
  return gameFetch<CharacterRollResult>(
    `/characters/${characterId}/rolls/initiative`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
