import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { ApiFetchOptions } from "@/shared/api/dnd-api/api-client";
import {
  parseCharacterState,
  parseCharacterStateEnvelope,
  parseTransferInspirationResult,
} from "@/entities/character/lib/character-state.schema";
import type {
  CastSpellPayload,
  CastSpellResult,
  CharacterState,
  PatchCharacterStatePayload,
  RestPayload,
  RestResult,
  UseClassResourcePayload,
  UseClassResourceResult,
  UseManeuverResult,
} from "@/entities/character/session-types";

export async function sessionJson(
  path: string,
  accessToken: string,
  init?: Omit<ApiFetchOptions, "token">,
) {
  return gameFetch<unknown>(path, accessToken, init);
}

export async function sessionState(
  path: string,
  accessToken: string,
  init?: Omit<ApiFetchOptions, "token">,
) {
  return parseCharacterState(await sessionJson(path, accessToken, init));
}

export async function sessionWithState<T extends { state: CharacterState }>(
  path: string,
  accessToken: string,
  init?: Omit<ApiFetchOptions, "token">,
) {
  return parseCharacterStateEnvelope<T>(
    await sessionJson(path, accessToken, init),
  );
}

export const sessionKeys = {
  all: ["character-session"] as const,
  state: (characterId: string) =>
    [...sessionKeys.all, "state", characterId] as const,
};

export async function fetchCharacterState(
  accessToken: string,
  characterId: string,
) {
  return sessionState(`/characters/${characterId}/state`, accessToken);
}

export async function patchCharacterState(
  accessToken: string,
  characterId: string,
  payload: PatchCharacterStatePayload,
) {
  return sessionState(`/characters/${characterId}/state`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function castCharacterSpell(
  accessToken: string,
  characterId: string,
  payload: CastSpellPayload,
) {
  return sessionWithState<CastSpellResult>(
    `/characters/${characterId}/spells/cast`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function takeCharacterRest(
  accessToken: string,
  characterId: string,
  payload: RestPayload,
) {
  return sessionWithState<RestResult>(
    `/characters/${characterId}/rest`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function spendClassResource(
  accessToken: string,
  characterId: string,
  payload: UseClassResourcePayload,
) {
  return sessionWithState<UseClassResourceResult>(
    `/characters/${characterId}/resources/use`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function recoverClassResource(
  accessToken: string,
  characterId: string,
  payload: UseClassResourcePayload,
) {
  return sessionState(
    `/characters/${characterId}/resources/recover`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type TransferInspirationResult = {
  sourceState: CharacterState;
  targetState: CharacterState;
  note: string;
};

export async function transferInspiration(
  accessToken: string,
  characterId: string,
  targetCharacterId: string,
) {
  return parseTransferInspirationResult(
    await sessionJson(
      `/characters/${characterId}/state/transfer-inspiration`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ targetCharacterId }),
      },
    ),
  );
}

export type TableActionResult = {
  state: CharacterState;
  actionName: string;
  expression?: string;
  roll?: number;
  total?: number;
  saveDc?: number;
  resourceSpent: boolean;
  note: string;
};

export type FighterTableActionResult = TableActionResult;

export type GunslingerTableActionResult =
  | UseManeuverResult
  | TableActionResult;

export type ClassTableActionPayload = {
  actionSlug: string;
  amount?: number;
  diceCount?: number;
  companionCommand?: string;
  maneuverSlug?: string;
  itemSlug?: string;
  shots?: number;
  useRelentless?: boolean;
  spellSlug?: string;
  usePsiDie?: boolean;
  checkTotal?: number;
  dc?: number;
  optionSlug?: string;
  takeLowerBloodCost?: boolean;
  level?: number;
  masks?: string[];
  metamagicSlug?: string;
  pointsSpent?: number;
  slotLevel?: number;
  templateSlug?: string;
  templateSlugs?: string[];
  replaceSlug?: string;
};

export type ClassTableActionInput = string | ClassTableActionPayload;

export type FighterTableActionInput = ClassTableActionPayload;
export type DruidTableActionInput = ClassTableActionPayload;
export type SorcererTableActionInput = ClassTableActionPayload;

export async function postClassTableAction<T extends { state: CharacterState }>(
  accessToken: string,
  characterId: string,
  owner: string,
  body: unknown,
) {
  return sessionWithState<T>(
    `/characters/${characterId}/${owner}/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

function payloadFromInput(input: ClassTableActionInput): ClassTableActionPayload {
  return typeof input === "string" ? { actionSlug: input } : input;
}

export async function executeClassTableAction(
  accessToken: string,
  characterId: string,
  owner: string,
  input: ClassTableActionInput,
) {
  return postClassTableAction<TableActionResult>(
    accessToken,
    characterId,
    owner,
    payloadFromInput(input),
  );
}

function bindClassOwner(owner: string) {
  return async function executeBoundTableAction(
    accessToken: string,
    characterId: string,
    input: ClassTableActionInput,
  ) {
    return executeClassTableAction(accessToken, characterId, owner, input);
  };
}

export const executeBarbarianTableAction = bindClassOwner("barbarian");
export const executeFighterTableAction = bindClassOwner("fighter");
export const executeRogueTableAction = bindClassOwner("rogue");
export const executeMonkTableAction = bindClassOwner("monk");
export const executePaladinTableAction = bindClassOwner("paladin");
export const executeRangerTableAction = bindClassOwner("ranger");
export const executeClericTableAction = bindClassOwner("cleric");
export const executeBardTableAction = bindClassOwner("bard");
export const executeSorcererTableAction = bindClassOwner("sorcerer");
export const executeWarlockTableAction = bindClassOwner("warlock");
export const executeDruidTableAction = bindClassOwner("druid");
export const executeWizardTableAction = bindClassOwner("wizard");
export const executeGunslingerTableAction = bindClassOwner("gunslinger");
export const executeMonsterHunterTableAction = bindClassOwner(
  "monster-hunter",
);
