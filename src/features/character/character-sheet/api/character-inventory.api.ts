import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  AddInventoryItemPayload,
  CharacterInventory,
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";

export const inventoryKeys = {
  all: ["character-inventory"] as const,
  list: (characterId: string) =>
    [...inventoryKeys.all, "list", characterId] as const,
};

export async function fetchCharacterInventory(
  accessToken: string,
  characterId: string,
) {
  return gameFetch<CharacterInventory>(
    `/characters/${characterId}/inventory`,
    accessToken,
  );
}

export async function addInventoryItem(
  accessToken: string,
  characterId: string,
  payload: AddInventoryItemPayload,
) {
  return gameFetch<InventoryItem>(
    `/characters/${characterId}/inventory`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function patchInventoryItem(
  accessToken: string,
  characterId: string,
  itemSlug: string,
  payload: PatchInventoryItemPayload,
) {
  return gameFetch<InventoryItem>(
    `/characters/${characterId}/inventory/${itemSlug}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function removeInventoryItem(
  accessToken: string,
  characterId: string,
  itemSlug: string,
) {
  return gameFetch<void>(
    `/characters/${characterId}/inventory/${itemSlug}`,
    accessToken,
    { method: "DELETE" },
  );
}
