import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  CastSpellPayload,
  CastSpellResult,
  CharacterState,
  GunslingerManeuver,
  PatchCharacterStatePayload,
  RestPayload,
  RestResult,
  UseClassResourcePayload,
  UseClassResourceResult,
  UseManeuverResult,
} from "@/entities/character/session-types";

export const sessionKeys = {
  all: ["character-session"] as const,
  state: (characterId: string) =>
    [...sessionKeys.all, "state", characterId] as const,
};

export async function fetchCharacterState(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/state`,
    accessToken,
  );
}

export async function patchCharacterState(
  accessToken: string,
  characterId: string,
  payload: PatchCharacterStatePayload,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/state`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function castCharacterSpell(
  accessToken: string,
  characterId: string,
  payload: CastSpellPayload,
) {
  return gameFetch<CastSpellResult>(
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
  return gameFetch<RestResult>(`/characters/${characterId}/rest`, accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function spendClassResource(
  accessToken: string,
  characterId: string,
  payload: UseClassResourcePayload,
) {
  return gameFetch<UseClassResourceResult>(
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
  return gameFetch<CharacterState>(
    `/characters/${characterId}/resources/recover`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function listManeuvers(accessToken: string, characterId: string) {
  return gameFetch<GunslingerManeuver[]>(
    `/characters/${characterId}/maneuvers`,
    accessToken,
  );
}

export async function executeGunslingerManeuver(
  accessToken: string,
  characterId: string,
  maneuverSlug: string,
) {
  return gameFetch<UseManeuverResult>(
    `/characters/${characterId}/maneuvers/use`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ maneuverSlug }),
    },
  );
}

export async function reloadFirearm(
  accessToken: string,
  characterId: string,
  itemSlug: string,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/firearms/reload`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ itemSlug }),
    },
  );
}

export async function fireChamber(
  accessToken: string,
  characterId: string,
  itemSlug: string,
  shots = 1,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/firearms/fire`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ itemSlug, shots }),
    },
  );
}

export async function recoverRisk(accessToken: string, characterId: string) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/resources/risk/recover`,
    accessToken,
    { method: "POST", body: "{}" },
  );
}

export async function toggleRage(
  accessToken: string,
  characterId: string,
  active?: boolean,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/rage/toggle`,
    accessToken,
    { method: "POST", body: JSON.stringify(active == null ? {} : { active }) },
  );
}

export async function toggleReckless(
  accessToken: string,
  characterId: string,
  active?: boolean,
) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/reckless/toggle`,
    accessToken,
    { method: "POST", body: JSON.stringify(active == null ? {} : { active }) },
  );
}

export async function recoverAllRage(accessToken: string, characterId: string) {
  return gameFetch<CharacterState>(
    `/characters/${characterId}/resources/rage/recover-all`,
    accessToken,
    { method: "POST", body: "{}" },
  );
}

export type SecondWindResult = {
  state: CharacterState;
  expression: string;
  healAmount: number;
  hitPointsCurrent: number;
  note?: string;
};

export type TacticalMindResult = {
  state: CharacterState;
  expression: string;
  roll: number;
  newTotal?: number;
  success?: boolean;
  resourceSpent: boolean;
  note: string;
};

export type ActionSurgeResult = {
  state: CharacterState;
  note: string;
};

export type BattleMasterManeuver = {
  slug: string;
  name: string;
  description: string;
  timing: string;
  addsToDamage: boolean;
  addsToAttack: boolean;
};

export type FighterTableActionResult = {
  state: CharacterState;
  actionName: string;
  expression?: string;
  roll?: number;
  total?: number;
  saveDc?: number;
  resourceSpent: boolean;
  note: string;
};

export type TableActionResult = FighterTableActionResult;

export type PsiWarriorActionSlug =
  | "protective-field"
  | "telekinetic-movement"
  | "psychic-leap"
  | "mental-guard"
  | "energy-bulwark"
  | "telekinetic-master";

export type RogueTableActionSlug =
  | "psychic-blade-main"
  | "psychic-blade-bonus"
  | "psi-bolstered-knack"
  | "guided-strike"
  | "psychic-whispers"
  | "psychic-teleport"
  | "psychic-veil"
  | "rend-mind"
  | "spell-thief"
  | "arachnoid-web"
  | "magic-device-charge";

export async function activateSecondWind(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<SecondWindResult>(
    `/characters/${characterId}/fighter/second-wind`,
    accessToken,
    { method: "POST", body: "{}" },
  );
}

export async function applyTacticalMind(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<TacticalMindResult>(
    `/characters/${characterId}/fighter/tactical-mind`,
    accessToken,
    { method: "POST", body: "{}" },
  );
}

export async function activateActionSurge(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<ActionSurgeResult>(
    `/characters/${characterId}/fighter/action-surge`,
    accessToken,
    { method: "POST", body: "{}" },
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

export async function executeBattleMasterManeuver(
  accessToken: string,
  characterId: string,
  maneuverSlug: string,
  useRelentless = false,
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/fighter/maneuvers/use`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ maneuverSlug, useRelentless }),
    },
  );
}

export async function executePsiWarriorAction(
  accessToken: string,
  characterId: string,
  actionSlug: PsiWarriorActionSlug,
  usePsiDie = false,
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/fighter/psi-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ actionSlug, usePsiDie }),
    },
  );
}

export async function castDungeonPrecaution(
  accessToken: string,
  characterId: string,
  spellSlug: string,
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/fighter/dungeon-precaution`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ spellSlug }),
    },
  );
}

export async function executeRogueTableAction(
  accessToken: string,
  characterId: string,
  payload: {
    actionSlug: RogueTableActionSlug;
    checkTotal?: number;
    dc?: number;
    usePsiDie?: boolean;
  },
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/rogue/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type MonkTableActionSlug =
  | "flurry-of-blows"
  | "patient-defense"
  | "step-of-the-wind"
  | "stunning-strike"
  | "open-hand-technique"
  | "elemental-blast"
  | "hand-of-healing"
  | "hand-of-harm"
  | "shadow-step";

export async function executeMonkTableAction(
  accessToken: string,
  characterId: string,
  actionSlug: MonkTableActionSlug,
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/monk/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ actionSlug }),
    },
  );
}

export type PaladinTableActionSlug =
  | "lay-on-hands"
  | "cure-poison"
  | "divine-sense"
  | "abjure-enemies"
  | "oath-channel";

export async function executePaladinTableAction(
  accessToken: string,
  characterId: string,
  payload: { actionSlug: PaladinTableActionSlug; amount?: number },
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/paladin/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type RangerTableActionSlug =
  | "hunters-mark-free"
  | "tireless"
  | "natures-veil"
  | "fey-reinforcements"
  | "misty-wanderer"
  | "primal-companion"
  | "set-bestial-aspect"
  | "feral-howl";

export async function executeRangerTableAction(
  accessToken: string,
  characterId: string,
  payload: { actionSlug: RangerTableActionSlug; level?: number },
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/ranger/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type ClericTableActionSlug =
  | "divine-spark-heal"
  | "divine-spark-damage"
  | "turn-undead"
  | "divine-intervention"
  | "preserve-life"
  | "radiance-of-dawn"
  | "warding-flare"
  | "crown-of-light"
  | "tricksters-blessing"
  | "invoke-duplicity"
  | "guided-strike"
  | "war-priest"
  | "war-gods-blessing";

export async function executeClericTableAction(
  accessToken: string,
  characterId: string,
  actionSlug: ClericTableActionSlug,
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/cleric/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ actionSlug }),
    },
  );
}

export type BardTableActionSlug =
  | "grant-inspiration"
  | "cutting-words"
  | "enthralling-performance"
  | "agile-response"
  | "unarmed-dance"
  | "combat-inspiration"
  | "superior-inspiration"
  | "set-persona-masks";

export async function executeBardTableAction(
  accessToken: string,
  characterId: string,
  payload: { actionSlug: BardTableActionSlug; masks?: string[] },
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/bard/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type SorcererTableActionSlug =
  | "convert-slot-1-to-points"
  | "convert-slot-2-to-points"
  | "convert-slot-3-to-points"
  | "convert-slot-4-to-points"
  | "convert-slot-5-to-points"
  | "convert-points-to-slot-1"
  | "convert-points-to-slot-2"
  | "convert-points-to-slot-3"
  | "convert-points-to-slot-4"
  | "convert-points-to-slot-5"
  | "use-metamagic-1"
  | "use-metamagic-2"
  | "use-metamagic-3"
  | "innate-sorcery"
  | "sorcerous-restoration"
  | "tides-of-chaos"
  | "bastion-of-law";

export async function executeSorcererTableAction(
  accessToken: string,
  characterId: string,
  actionSlug: SorcererTableActionSlug,
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/sorcerer/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ actionSlug }),
    },
  );
}

export type WarlockTableActionSlug =
  | "magical-cunning"
  | "healing-light"
  | "dark-ones-luck"
  | "fey-step-effect"
  | "awakened-mind"
  | "fiendish-resilience"
  | "invoke-pact-weapon"
  | "hurl-through-hell"
  | "searing-vengeance"
  | "beguiling-defenses"
  | "clairvoyant-combatant";

export async function executeWarlockTableAction(
  accessToken: string,
  characterId: string,
  payload: {
    actionSlug: WarlockTableActionSlug;
    itemSlug?: string;
    diceCount?: number;
  },
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/warlock/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type DruidTableActionSlug =
  | "wild-shape"
  | "wild-resurgence-slot"
  | "wild-resurgence-shape"
  | "starry-form-archer"
  | "starry-form-chalice"
  | "starry-form-dragon"
  | "wrath-of-the-sea"
  | "moon-combat-wild-shape";

export async function executeDruidTableAction(
  accessToken: string,
  characterId: string,
  actionSlug: DruidTableActionSlug,
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/druid/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ actionSlug }),
    },
  );
}

export type WizardTableActionSlug =
  | "arcane-recovery-1"
  | "arcane-recovery-2"
  | "arcane-recovery-3"
  | "arcane-recovery-4"
  | "arcane-recovery-5"
  | "arcane-ward"
  | "arcane-ward-recharge"
  | "projected-ward"
  | "spell-breaker"
  | "portent"
  | "third-eye"
  | "sculpt-spells"
  | "overchannel"
  | "improved-illusions"
  | "spectral-summon"
  | "illusory-self"
  | "illusory-reality"
  | "spell-mastery"
  | "arm-missile-shield"
  | "disarm-missile-shield"
  | "arm-giga-missile"
  | "disarm-giga-missile";

export async function executeWizardTableAction(
  accessToken: string,
  characterId: string,
  actionSlug: WizardTableActionSlug,
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/wizard/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ actionSlug }),
    },
  );
}
