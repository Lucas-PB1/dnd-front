import type { ClassEconomyActionRecord } from "@/entities/combat-mechanical/types";
import {
  resolveClassEconomyActions,
  type ClassEconomyAction,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";

export const GUNSLINGER_PANEL_REMINDER_IDS = [
  "gunslinger-white-hat-lay-down-law",
  "gunslinger-white-hat-steel-eyes",
  "gunslinger-white-hat-reach-heavens",
  "gunslinger-white-hat-long-arm",
  "gunslinger-risky-business",
  "gunslinger-risk-taker",
  "gunslinger-double-or-nothing",
  "gunslinger-bang-youre-dead",
  "gunslinger-arcane-shot",
] as const;

const REMINDER_ID_SET = new Set<string>(GUNSLINGER_PANEL_REMINDER_IDS);

export function gunslingerPanelReminders(
  catalog: readonly ClassEconomyActionRecord[],
  input: { level: number; subclassSlug?: string | null },
): ClassEconomyAction[] {
  return resolveClassEconomyActions(catalog, {
    classSlug: "gunslinger",
    level: input.level,
    subclassSlug: input.subclassSlug,
  }).filter((action) => REMINDER_ID_SET.has(action.id));
}
