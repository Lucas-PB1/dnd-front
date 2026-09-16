import {
  postClassTableAction,
  type TableActionResult,
} from "@/features/character/character-sheet/api/session/session-client";

export type TransformationTableActionPayload = {
  actionSlug: string;
  mutationSlug?: string | null;
};

export async function executeTransformationTableAction(
  accessToken: string,
  characterId: string,
  payload: TransformationTableActionPayload | string,
) {
  const body =
    typeof payload === "string"
      ? { actionSlug: payload }
      : {
          actionSlug: payload.actionSlug,
          ...(payload.mutationSlug !== undefined
            ? { mutationSlug: payload.mutationSlug }
            : {}),
        };
  return postClassTableAction<TableActionResult>(
    accessToken,
    characterId,
    "transformation",
    body,
  );
}

export type FeatTableActionPayload = {
  featSlug: string;
  actionSlug: string;
  itemSlug?: string;
  enabled?: boolean;
};

export async function executeFeatTableAction(
  accessToken: string,
  characterId: string,
  payload: FeatTableActionPayload,
) {
  return postClassTableAction<TableActionResult>(
    accessToken,
    characterId,
    "feat",
    payload,
  );
}

export type ItemTableActionPayload = {
  itemSlug: string;
  actionSlug: string;
};

export async function executeItemTableAction(
  accessToken: string,
  characterId: string,
  payload: ItemTableActionPayload,
) {
  return postClassTableAction<TableActionResult>(
    accessToken,
    characterId,
    "item",
    payload,
  );
}
