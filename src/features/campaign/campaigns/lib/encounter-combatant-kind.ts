import type { EncounterCombatant } from "@/features/campaign/campaigns/api/encounters.api";

export function isEncounterActor(combatant: EncounterCombatant): boolean {
  return combatant.kind === "actor";
}
