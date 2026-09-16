import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  VehicleSheetActionPayload,
  VehicleSheetActionResponse,
} from "@/entities/actor/vehicle-sheet";

export async function postVehicleSheetAction(
  accessToken: string,
  characterId: string,
  payload: VehicleSheetActionPayload,
) {
  return gameFetch<VehicleSheetActionResponse>(
    `/characters/${characterId}/vehicles/sheet-actions`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
