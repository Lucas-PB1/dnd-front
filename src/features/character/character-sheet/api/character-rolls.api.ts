import { gameFetch } from "@/shared/api/dnd-api/api-client";

export type AdvantageMode = "normal" | "advantage" | "disadvantage";

export type AttackCoverLevel = "none" | "half" | "three_quarters" | "full";

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
  targetAcBonus?: number;
  effectiveTargetAc?: number;
  hit?: boolean;
  blocked?: boolean;
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
  targetCover?: AttackCoverLevel;
  longRange?: boolean;
  meleeWithRanged?: boolean;
  targetAc?: number;
  brutalStrike?: boolean;
  spentInspiration?: boolean;
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
  divineStrike?: boolean;
  damageDieFloor?: boolean;
  damageDieFlip?: boolean;
  damageDieExplode?: boolean;
};

export type RollSkillPayload = {
  skillSlug: string;
  advantage?: AdvantageMode;
  strokeOfLuck?: boolean;
  spentInspiration?: boolean;
  dc?: number;
};

export type RollSavingThrowPayload = {
  abilitySlug: string;
  advantage?: AdvantageMode;
  indomitable?: boolean;
  strokeOfLuck?: boolean;
  spentInspiration?: boolean;
  dc?: number;
};

export type RollInitiativePayload = {
  advantage?: AdvantageMode;
  strokeOfLuck?: boolean;
  stonePulse?: boolean;
  kasInitiativeBoost?: boolean;
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
