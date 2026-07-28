import { gameFetch } from "@/shared/api/dnd-api/api-client";

export type CreatureHpVisibility = "hidden" | "percent" | "exact";
export type AdvantageMode = "normal" | "advantage" | "disadvantage";

export type EncounterCombatant = {
  id: string;
  kind: "pc" | "creature";
  characterId: string | null;
  displayName: string;
  initiativeTotal: number | null;
  initiativeModifier: number | null;
  sortOrder: number;
  isActive: boolean;
  isCurrentTurn: boolean;
  level: number | null;
  armorClass: number | null;
  hpCurrent: number | null;
  hpMax: number | null;
  hpPercent: number | null;
  featSlugs: string[];
  conditions: string[];
  inspiration: boolean | null;
};

export type CampaignEncounter = {
  id: string;
  campaignId: string;
  name: string;
  status: "active" | "closed";
  round: number;
  currentTurnIndex: number;
  playersCanView: boolean;
  creatureHpVisibility: CreatureHpVisibility;
  currentCombatantId: string | null;
  currentCharacterId: string | null;
  combatants: EncounterCombatant[];
};

export type AddCreaturePayload = {
  name: string;
  hpMax: number;
  hpCurrent?: number;
  armorClass: number;
  initiativeModifier?: number;
};

export type PatchCombatantPayload = {
  initiativeTotal?: number;
  initiativeModifier?: number;
  isActive?: boolean;
  displayName?: string;
  hpCurrent?: number;
  hpMax?: number;
  armorClass?: number;
};

export type PatchEncounterPayload = {
  name?: string;
  playersCanView?: boolean;
  creatureHpVisibility?: CreatureHpVisibility;
};

export const encountersKeys = {
  all: (campaignId: string) =>
    ["campaigns", campaignId, "encounters"] as const,
  active: (campaignId: string) =>
    [...encountersKeys.all(campaignId), "active"] as const,
};

function base(campaignId: string) {
  return `/campaigns/${campaignId}/encounters`;
}

export async function fetchActiveEncounter(
  accessToken: string,
  campaignId: string,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/active`,
    accessToken,
  );
}

export async function createEncounter(
  accessToken: string,
  campaignId: string,
  payload: { name: string },
) {
  return gameFetch<CampaignEncounter>(base(campaignId), accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchEncounter(
  accessToken: string,
  campaignId: string,
  encounterId: string,
  payload: PatchEncounterPayload,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}`,
    accessToken,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function addEncounterCreature(
  accessToken: string,
  campaignId: string,
  encounterId: string,
  payload: AddCreaturePayload,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}/creatures`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rollAllInitiative(
  accessToken: string,
  campaignId: string,
  encounterId: string,
  advantage?: AdvantageMode,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}/roll-all-initiative`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(advantage ? { advantage } : {}),
    },
  );
}

export async function rollCombatantInitiative(
  accessToken: string,
  campaignId: string,
  encounterId: string,
  combatantId: string,
  advantage?: AdvantageMode,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}/combatants/${combatantId}/roll-initiative`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(advantage ? { advantage } : {}),
    },
  );
}

export async function patchEncounterCombatant(
  accessToken: string,
  campaignId: string,
  encounterId: string,
  combatantId: string,
  payload: PatchCombatantPayload,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}/combatants/${combatantId}`,
    accessToken,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function removeEncounterCombatant(
  accessToken: string,
  campaignId: string,
  encounterId: string,
  combatantId: string,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}/combatants/${combatantId}`,
    accessToken,
    { method: "DELETE" },
  );
}

export async function nextEncounterTurn(
  accessToken: string,
  campaignId: string,
  encounterId: string,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}/next-turn`,
    accessToken,
    { method: "POST" },
  );
}

export async function closeEncounter(
  accessToken: string,
  campaignId: string,
  encounterId: string,
) {
  return gameFetch<CampaignEncounter>(
    `${base(campaignId)}/${encounterId}/close`,
    accessToken,
    { method: "POST" },
  );
}
