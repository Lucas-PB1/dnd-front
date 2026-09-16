export const VEHICLE_SHEET_ACTIONS = [
  "board",
  "dismount",
  "set-metrics",
  "helm",
] as const;

export type VehicleSheetAction = (typeof VEHICLE_SHEET_ACTIONS)[number];

export type VehicleSheetActionPayload = {
  action: VehicleSheetAction;
  actorId?: string | null;
  crewCurrent?: number;
  passengerCurrent?: number;
  cargoCurrentLb?: number;
};

export type VehicleSheetActorState = {
  actorId: string;
  hitPointsCurrent: number | null;
  hitPointsMax: number | null;
  armorClass: number | null;
  crewCapacity: number | null;
  passengerCapacity: number | null;
  cargoCapacityLb: number | null;
  crewCurrent: number;
  passengerCurrent: number;
  cargoCurrentLb: number;
};

export type VehicleSheetActionResponse = {
  boardedActorId: string | null;
  actionName: string;
  note: string;
  resourceSpent: boolean;
  actorState?: VehicleSheetActorState;
};
