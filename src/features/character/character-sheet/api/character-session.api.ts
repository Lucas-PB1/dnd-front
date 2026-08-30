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

export type BarbarianTableActionSlug =
  | "toggle-rage"
  | "toggle-reckless"
  | "recover-all-rage"
  | "frenzy"
  | "wild-heart-eagle"
  | "fanatical-focus"
  | "retaliation"
  | "intimidating-presence"
  | "restore-intimidating-presence"
  | "champion-of-the-gods"
  | "zealous-presence"
  | "restore-zealous-presence"
  | "rage-of-the-gods"
  | "revitalizing-strength"
  | "branches-of-the-tree"
  | "traverse-the-tree"
  | "undeniable-magic-rage"
  | "cantrip-mage-hand"
  | "cantrip-shocking-grasp"
  | "cantrip-sure-strike"
  | "burning-hands-slap"
  | "magic-missile-throws"
  | "shield-block"
  | "i-cast-fist";

export async function executeBarbarianTableAction(
  accessToken: string,
  characterId: string,
  payload: { actionSlug: BarbarianTableActionSlug; diceCount?: number },
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/barbarian/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

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

export type GunslingerTableActionSlug =
  | "use-maneuver"
  | "recover-risk"
  | "reload-firearm"
  | "fire-chamber";

export type GunslingerTableActionResult =
  | UseManeuverResult
  | FighterTableActionResult;

export async function executeGunslingerTableAction(
  accessToken: string,
  characterId: string,
  payload: {
    actionSlug: GunslingerTableActionSlug;
    maneuverSlug?: string;
    itemSlug?: string;
    shots?: number;
  },
) {
  return gameFetch<GunslingerTableActionResult>(
    `/characters/${characterId}/gunslinger/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type FighterTableActionSlug =
  | "second-wind"
  | "action-surge"
  | "tactical-mind"
  | "use-maneuver"
  | "dungeon-precaution"
  | "psi:protective-field"
  | "psi:telekinetic-movement"
  | "psi:psychic-leap"
  | "psi:mental-guard"
  | "psi:energy-bulwark"
  | "psi:telekinetic-master";

export type FighterTableActionInput = {
  actionSlug: FighterTableActionSlug;
  maneuverSlug?: string;
  useRelentless?: boolean;
  spellSlug?: string;
  usePsiDie?: boolean;
  checkTotal?: number;
  dc?: number;
};

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

export async function listBattleMasterManeuvers(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<BattleMasterManeuver[]>(
    `/characters/${characterId}/fighter/maneuvers`,
    accessToken,
  );
}

export async function executeFighterTableAction(
  accessToken: string,
  characterId: string,
  input: FighterTableActionInput,
) {
  return gameFetch<FighterTableActionResult>(
    `/characters/${characterId}/fighter/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(input),
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
  | "wholeness-of-body"
  | "vibrating-palm"
  | "elemental-attunement"
  | "elemental-blast"
  | "hand-of-healing"
  | "hand-of-harm"
  | "flurry-of-healing-and-harm"
  | "hand-of-ultimate-mercy"
  | "shadow-arts"
  | "shadow-step"
  | "improved-shadow-step"
  | "cloak-of-shadows"
  | "street-combo"
  | "energy-burst"
  | "guard-breaker"
  | "uppercut"
  | "air-dash"
  | "knockout"
  | "recover-knockout";

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
  | "oath-channel"
  | "inspiring-smite"
  | "peerless-athlete";

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
  | "hunter-defense"
  | "gloom-stalker-dodge"
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
  | "war-gods-blessing"
  | "dragon-majesty"
  | "serpent-blessing"
  | "chromatic-affinity"
  | "legendary-aspect-rend"
  | "legendary-aspect-tail"
  | "legendary-aspect-wings";

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
  | "peerless-skill"
  | "mantle-of-inspiration"
  | "mantle-of-majesty"
  | "unbreakable-majesty"
  | "agile-response"
  | "coordinated-movement"
  | "unarmed-dance"
  | "combat-inspiration"
  | "superior-inspiration"
  | "virtuoso-skill"
  | "persona-angel"
  | "persona-devil"
  | "persona-dragon"
  | "persona-gladiator"
  | "persona-jester"
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
  | "use-metamagic"
  | "innate-sorcery"
  | "sorcerous-restoration"
  | "tides-of-chaos"
  | "bastion-of-law"
  | "restore-balance"
  | "dragon-wings"
  | "bend-luck"
  | "heroic-soul"
  | "mystical-maneuver"
  | "warp-implosion";

export type SorcererTableActionInput = {
  actionSlug: SorcererTableActionSlug;
  metamagicSlug?: string;
  /** Bastião da Lei: 1–5 Pontos de Feitiçaria. */
  pointsSpent?: number;
};

export async function executeSorcererTableAction(
  accessToken: string,
  characterId: string,
  input: SorcererTableActionInput,
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/sorcerer/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(input),
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
  | "starry-form-end"
  | "stellar-guidance"
  | "cosmic-omen"
  | "wrath-of-the-sea"
  | "ocean-manifestation"
  | "moon-combat-wild-shape"
  | "lunar-step"
  | "restore-lunar-step"
  | "land-aid"
  | "nature-sanctuary"
  | "natural-recovery-1"
  | "natural-recovery-2"
  | "natural-recovery-3"
  | "natural-recovery-4"
  | "natural-recovery-5"
  | "city-shape"
  | "wall-warp";

export async function executeDruidTableAction(
  accessToken: string,
  characterId: string,
  actionSlug: DruidTableActionSlug | { actionSlug: DruidTableActionSlug; slotLevel?: number },
) {
  const payload =
    typeof actionSlug === "string" ? { actionSlug } : actionSlug;
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/druid/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
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

export async function executeMonsterHunterTableAction(
  accessToken: string,
  characterId: string,
  actionSlug: string,
) {
  return gameFetch<TableActionResult>(
    `/characters/${characterId}/monster-hunter/table-action`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ actionSlug }),
    },
  );
}
