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
  options?: { quantity?: number; mode?: "sell" | "discard" },
) {
  const params = new URLSearchParams();
  if (options?.quantity != null) {
    params.set("quantity", String(options.quantity));
  }
  if (options?.mode) {
    params.set("mode", options.mode);
  }
  const qs = params.toString();
  return gameFetch<void>(
    `/characters/${characterId}/inventory/${itemSlug}${qs ? `?${qs}` : ""}`,
    accessToken,
    { method: "DELETE" },
  );
}

export async function purchaseInventory(
  accessToken: string,
  characterId: string,
  payload: {
    lines: Array<{
      itemSlug: string;
      quantity?: number;
      attachCoverageSlug?: string;
      attachCoverageBonus?: 1 | 2 | 3;
      attachToBaseSlug?: string;
    }>;
    pay?: boolean;
  },
) {
  return gameFetch<CharacterInventory>(
    `/characters/${characterId}/inventory/purchase`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type InventoryActionSlug =
  | "attach-weapon-charm"
  | "detach-weapon-charm"
  | "attach-coverage"
  | "detach-coverage"
  | "artifact-regen"
  | "sentient-conflict"
  | "artifact-reroll";

export type InventoryActionPayload = {
  actionSlug: InventoryActionSlug;
  weaponSlug?: string;
  baseItemSlug?: string;
  charmSlug?: string;
  coverageSlug?: string;
  bonus?: 1 | 2 | 3;
  spellSlug?: string;
  itemSlug?: string;
};

export type ArtifactRegenResult = {
  itemSlug: string;
  dice: string;
  roll: number;
  hitPointsHealed: number;
  hitPointsCurrent: number;
  note: string;
};

export async function runInventoryAction<T = InventoryItem | ArtifactRegenResult>(
  accessToken: string,
  characterId: string,
  payload: InventoryActionPayload,
) {
  return gameFetch<T>(
    `/characters/${characterId}/inventory/actions`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
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
  return runInventoryAction<InventoryItem>(accessToken, characterId, {
    actionSlug: "attach-weapon-charm",
    ...payload,
  });
}

export async function detachWeaponCharm(
  accessToken: string,
  characterId: string,
  payload: DetachWeaponCharmPayload,
) {
  return runInventoryAction<InventoryItem>(accessToken, characterId, {
    actionSlug: "detach-weapon-charm",
    ...payload,
  });
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
  return runInventoryAction<InventoryItem>(accessToken, characterId, {
    actionSlug: "attach-coverage",
    ...payload,
  });
}

export async function detachCoverage(
  accessToken: string,
  characterId: string,
  payload: DetachCoveragePayload,
) {
  return runInventoryAction<InventoryItem>(accessToken, characterId, {
    actionSlug: "detach-coverage",
    ...payload,
  });
}

export type SentientConflictResult = {
  itemSlug: string;
  saveDc: number;
  itemCharisma: number;
  itemCharismaMod: number;
  note: string;
};

export async function runSentientConflict(
  accessToken: string,
  characterId: string,
  itemSlug: string,
) {
  return runInventoryAction<SentientConflictResult>(accessToken, characterId, {
    actionSlug: "sentient-conflict",
    itemSlug,
  });
}

export async function rerollArtifactProperties(
  accessToken: string,
  characterId: string,
  itemSlug: string,
) {
  return runInventoryAction<InventoryItem>(accessToken, characterId, {
    actionSlug: "artifact-reroll",
    itemSlug,
  });
}
