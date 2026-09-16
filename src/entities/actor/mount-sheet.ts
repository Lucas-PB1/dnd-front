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
