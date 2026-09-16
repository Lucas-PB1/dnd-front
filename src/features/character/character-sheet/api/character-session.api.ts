export type { CompanionCommandSlug } from "@/entities/companion/lib/companion-commands";

export {
  sessionKeys,
  fetchCharacterState,
  patchCharacterState,
  castCharacterSpell,
  takeCharacterRest,
  spendClassResource,
  recoverClassResource,
  transferInspiration,
  type TransferInspirationResult,
  type TableActionResult,
  type FighterTableActionResult,
  type GunslingerTableActionResult,
  type ClassTableActionPayload,
  type ClassTableActionInput,
  type FighterTableActionInput,
  type DruidTableActionInput,
  type SorcererTableActionInput,
  executeClassTableAction,
  executeBarbarianTableAction,
  executeFighterTableAction,
  executeRogueTableAction,
  executeMonkTableAction,
  executePaladinTableAction,
  executeRangerTableAction,
  executeClericTableAction,
  executeBardTableAction,
  executeSorcererTableAction,
  executeWarlockTableAction,
  executeDruidTableAction,
  executeWizardTableAction,
  executeGunslingerTableAction,
  executeMonsterHunterTableAction,
} from "@/features/character/character-sheet/api/session/session-client";

export {
  listManeuvers,
  listBattleMasterManeuvers,
  type BattleMasterManeuver,
} from "@/features/character/character-sheet/api/session/maneuvers-session.api";

export {
  executeTransformationTableAction,
  executeFeatTableAction,
  executeItemTableAction,
  type TransformationTableActionPayload,
  type FeatTableActionPayload,
  type ItemTableActionPayload,
} from "@/features/character/character-sheet/api/session/extra-session.api";
