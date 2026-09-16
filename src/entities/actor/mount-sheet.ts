export const MOUNT_SHEET_ACTIONS = [
  "board",
  "dismount",
  "healing-touch",
  "fey-step",
  "frighten",
] as const;

export type MountSheetAction = (typeof MOUNT_SHEET_ACTIONS)[number];

export type MountSheetHealTarget = "rider" | "mount";

export type MountSheetActionPayload = {
  action: MountSheetAction;
  actorId?: string | null;
  amount?: number;
  target?: MountSheetHealTarget;
};

export type MountSheetActionResponse = {
  boardedActorId: string | null;
  actionName: string;
  note: string;
  resourceSpent: boolean;
  healed?: number;
};

export const OTHERWORLDLY_STEED_PREFIX = "montaria-sobrenatural-";

export const MOUNT_HEALING_TOUCH_MIN_AMOUNT = 1;

export const MOUNT_LONG_REST_USE_KEY = {
  healingTouch: "toque-curativo",
  feyStep: "passo-feerico",
  frighten: "derrubar-brilho",
} as const;

export function isCelestialSteedTemplate(
  templateSlug: string | null | undefined,
): boolean {
  return templateSlug === `${OTHERWORLDLY_STEED_PREFIX}celestial`;
}

export function isFeySteedTemplate(
  templateSlug: string | null | undefined,
): boolean {
  return templateSlug === `${OTHERWORLDLY_STEED_PREFIX}feerico`;
}

export function isFiendSteedTemplate(
  templateSlug: string | null | undefined,
): boolean {
  return templateSlug === `${OTHERWORLDLY_STEED_PREFIX}infero`;
}

export function mountLongRestUseSpent(
  uses: Record<string, number> | null | undefined,
  key: string,
): boolean {
  return (uses?.[key] ?? 0) >= 1;
}
