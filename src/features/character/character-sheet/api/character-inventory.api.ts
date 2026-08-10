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

export type AttachWeaponCharmPayload = {
  weaponSlug: string;
  charmSlug: string;
};

export type DetachWeaponCharmPayload = {
  weaponSlug: string;
};

export async function attachWeaponCharm(
  accessToken: string,
  characterId: string,
  payload: AttachWeaponCharmPayload,
) {
  return gameFetch<InventoryItem>(
    `/characters/${characterId}/inventory/weapon-charm/attach`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function detachWeaponCharm(
  accessToken: string,
  characterId: string,
  payload: DetachWeaponCharmPayload,
) {
  return gameFetch<InventoryItem>(
    `/characters/${characterId}/inventory/weapon-charm/detach`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type AttachCoveragePayload = {
  baseItemSlug: string;
  coverageSlug: string;
  bonus?: 1 | 2 | 3;
  spellSlug?: string;
};

export type DetachCoveragePayload = {
  baseItemSlug: string;
};

export async function attachCoverage(
  accessToken: string,
  characterId: string,
  payload: AttachCoveragePayload,
) {
  return gameFetch<InventoryItem>(
    `/characters/${characterId}/inventory/coverage/attach`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function detachCoverage(
  accessToken: string,
  characterId: string,
  payload: DetachCoveragePayload,
) {
  return gameFetch<InventoryItem>(
    `/characters/${characterId}/inventory/coverage/detach`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
