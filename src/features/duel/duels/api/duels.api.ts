import { gameFetch } from "@/shared/api/dnd-api/api-client";

export type DuelStatus =
  | "open"
  | "ready"
  | "active"
  | "finished"
  | "cancelled";

export type DuelCharacterSummary = {
  characterId: string;
  name: string;
  level: number;
  classSlug: string;
  speciesSlug: string | null;
};

export type DuelMember = {
  userId: string;
  characterId: string;
  characterName: string;
  level: number;
  classSlug: string;
  speciesSlug: string | null;
  ready: boolean;
  initiative: number | null;
  joinedAt: string;
};

export type DuelCombatant = {
  userId: string;
  characterId: string;
  characterName: string;
  level: number;
  classSlug: string;
  speciesSlug: string | null;
  ready: boolean;
  initiative: number | null;
  hitPointsCurrent: number;
  hitPointsMax: number;
  armorClass: number;
  portraitUrl: string | null;
  tempHp: number;
  conditions: string[];
  joinedAt: string;
};

export type DuelWeaponOption = {
  itemSlug: string;
  itemName: string;
  mode: "melee" | "ranged";
  attackBonus: number;
  masterySlug?: string | null;
};

export type DuelSpellOption = {
  spellSlug: string;
  listType: string;
};

export type DuelCombatLogEntry = {
  at: string;
  text: string;
};

export type DuelSummary = {
  id: string;
  status: DuelStatus;
  inviteCode: string;
  createdBy: string;
  myCharacter: DuelCharacterSummary | null;
  opponentCharacter: DuelCharacterSummary | null;
  winnerUserId: string | null;
  endReason: "hp" | "forfeit" | "cancel" | null;
  createdAt: string;
  updatedAt: string;
};

export type DuelBloodStrikeOption = {
  slug: string;
  label: string;
  costDice: string;
};

export type DuelBloodStrikePanel = {
  available: boolean;
  remaining: number;
  max: number;
  saveDc: number;
  options: DuelBloodStrikeOption[];
  canTakeLowerCost: boolean;
  canArmament: boolean;
  canExplosion: boolean;
};

export type DuelFighterPanel = {
  available: boolean;
  attacksPerAction: number;
  turnAttacksRemaining: number | null;
  tacticalMaster: boolean;
  secondWindRemaining: number;
  secondWindMax: number;
  actionSurgeRemaining: number;
  actionSurgeMax: number;
  indomitableRemaining: number;
  indomitableMax: number;
};

export type DuelDetail = DuelSummary & {
  viewerRole: "participant" | "spectator";
  members: DuelMember[];
  combatants: DuelCombatant[];
  turnCharacterId: string | null;
  round: number;
  myTurn: boolean;
  myWeapons: DuelWeaponOption[];
  mySpells: DuelSpellOption[];
  bloodStrike: DuelBloodStrikePanel | null;
  fighter: DuelFighterPanel | null;
  turnAttacksRemaining: number | null;
  arenaEffects: string[];
  arenaEffectSourceCharacterId: string | null;
  seesInMagicalDarkness: boolean;
  combatLog: DuelCombatLogEntry[];
};

export const duelsKeys = {
  all: ["duels"] as const,
  detail: (id: string) => [...duelsKeys.all, "detail", id] as const,
};

export function duelStatusLabel(status: DuelStatus): string {
  switch (status) {
    case "open":
      return "Aberto";
    case "ready":
      return "Prontos";
    case "active":
      return "Em combate";
    case "finished":
      return "Encerrado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

export async function fetchDuels(accessToken: string) {
  return gameFetch<DuelSummary[]>("/duels", accessToken);
}

export async function fetchDuelById(accessToken: string, id: string) {
  return gameFetch<DuelDetail>(`/duels/${id}`, accessToken);
}

export async function createDuel(
  accessToken: string,
  payload: { characterId: string },
) {
  return gameFetch<DuelDetail>("/duels", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function joinDuel(
  accessToken: string,
  payload: { inviteCode: string; characterId: string },
) {
  return gameFetch<DuelDetail>("/duels/join", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function setDuelReady(
  accessToken: string,
  duelId: string,
  ready: boolean,
) {
  return gameFetch<DuelDetail>(`/duels/${duelId}/ready`, accessToken, {
    method: "POST",
    body: JSON.stringify({ ready }),
  });
}

export async function attackInDuel(
  accessToken: string,
  duelId: string,
  payload: {
    itemSlug: string;
    mode: "melee" | "ranged";
    bloodStrike?: { optionSlug: string; takeLowerBloodCost?: boolean };
    damageTypeOverride?: "acid" | "necrotic" | "poison";
    bloodExplosionOnMiss?: boolean;
    masteryOverrideSlug?: "push" | "sap" | "slow";
    graze?: boolean;
  },
) {
  return gameFetch<DuelDetail>(`/duels/${duelId}/attack`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function castInDuel(
  accessToken: string,
  duelId: string,
  payload: { spellSlug: string; slotLevel?: number },
) {
  return gameFetch<DuelDetail>(`/duels/${duelId}/cast`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function changeDuelCondition(
  accessToken: string,
  duelId: string,
  payload: {
    action: "add" | "remove";
    target: "self" | "opponent";
    condition: string;
  },
) {
  return gameFetch<DuelDetail>(`/duels/${duelId}/conditions`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forfeitDuel(accessToken: string, duelId: string) {
  return gameFetch<DuelDetail>(`/duels/${duelId}/forfeit`, accessToken, {
    method: "POST",
  });
}

export async function secondWindInDuel(accessToken: string, duelId: string) {
  return gameFetch<DuelDetail>(`/duels/${duelId}/second-wind`, accessToken, {
    method: "POST",
  });
}

export async function actionSurgeInDuel(accessToken: string, duelId: string) {
  return gameFetch<DuelDetail>(`/duels/${duelId}/action-surge`, accessToken, {
    method: "POST",
  });
}
