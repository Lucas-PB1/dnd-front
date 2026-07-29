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
  note?: string;
};

export type RollAttackPayload = {
  itemSlug: string;
  mode: "melee" | "ranged";
  advantage?: AdvantageMode;
  automatic?: boolean;
  studiedAttack?: boolean;
  doorKick?: boolean;
  steadyAim?: boolean;
  strokeOfLuck?: boolean;
  assassinate?: boolean;
  preciseHunter?: boolean;
};

export type RollDamagePayload = {
  itemSlug: string;
  mode: "melee" | "ranged";
  critical?: boolean;
  grazeMiss?: boolean;
  headShot?: boolean;
  sightedReroll?: boolean;
  brutalStrike?: boolean;
  divineFury?: boolean;
  psiStrike?: boolean;
  monsterSlayer?: boolean;
  sneakAttack?: boolean;
  cunningStrikeEffects?: string[];
  poisonousSneak?: boolean;
  assassinSurprise?: boolean;
  assassinDeathStrike?: boolean;
  assassinPoisonFailedSave?: boolean;
  divineSmite?: boolean;
  smiteSlotLevel?: number;
  smiteVsUndeadOrFiend?: boolean;
  huntersMark?: boolean;
  colossusSlayer?: boolean;
  dreadfulStrikes?: boolean;
  dreadAmbusher?: boolean;
};

export type RollSkillPayload = {
  skillSlug: string;
  advantage?: AdvantageMode;
  strokeOfLuck?: boolean;
};

export type RollSavingThrowPayload = {
  abilitySlug: string;
  advantage?: AdvantageMode;
  indomitable?: boolean;
  strokeOfLuck?: boolean;
};

export type RollInitiativePayload = {
  advantage?: AdvantageMode;
  strokeOfLuck?: boolean;
};

export async function rollCharacterAttack(
  accessToken: string,
  characterId: string,
  payload: RollAttackPayload,
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
  payload: RollDamagePayload,
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
  payload: RollSkillPayload,
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
  payload: RollSavingThrowPayload,
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
  payload: RollInitiativePayload = {},
) {
  return gameFetch<CharacterRollResult>(
    `/characters/${characterId}/rolls/initiative`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
