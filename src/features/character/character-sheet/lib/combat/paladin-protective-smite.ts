import type { ClassEconomyActionRecord } from "@/entities/combat-mechanical/types";
import {
  resolveClassEconomyActions,
  type ClassEconomyAction,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";

export const PALADIN_PROTECTIVE_SMITE_ECONOMY_ID = "paladin-protective-smite";

export function paladinProtectiveSmiteReminder(
  catalog: readonly ClassEconomyActionRecord[],
  input: { level: number; subclassSlug?: string | null },
): ClassEconomyAction | null {
  return (
    resolveClassEconomyActions(catalog, {
      classSlug: "paladin",
      level: input.level,
      subclassSlug: input.subclassSlug,
    }).find((action) => action.id === PALADIN_PROTECTIVE_SMITE_ECONOMY_ID) ??
    null
  );
}
