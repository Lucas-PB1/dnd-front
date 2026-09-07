/** Circunstâncias de mesa — espelha dnd-api mesa-circumstances.ts */

export const MESA_CIRCUMSTANCE_TAGS = [
  "snow_ice",
  "in_water",
  "extreme_cold",
] as const;

export type MesaCircumstanceTag = (typeof MESA_CIRCUMSTANCE_TAGS)[number];

export const SNOWRUNNER_TOGGLE_ACTION = "snowrunner-toggle-snow-ice" as const;
export const COLD_PLUNGE_WATER_ACTION = "cold-plunge-toggle-in-water" as const;
export const COLD_PLUNGE_COLD_ACTION =
  "cold-plunge-toggle-extreme-cold" as const;

const ACTION_TO_TAG: Readonly<Record<string, MesaCircumstanceTag>> = {
  [SNOWRUNNER_TOGGLE_ACTION]: "snow_ice",
  [COLD_PLUNGE_WATER_ACTION]: "in_water",
  [COLD_PLUNGE_COLD_ACTION]: "extreme_cold",
};

export function mesaCircumstanceTagForAction(
  actionSlug: string | null | undefined,
): MesaCircumstanceTag | null {
  if (!actionSlug) return null;
  return ACTION_TO_TAG[actionSlug] ?? null;
}

export function isMesaCircumstanceToggleAction(
  actionSlug: string | null | undefined,
): boolean {
  return mesaCircumstanceTagForAction(actionSlug) != null;
}
