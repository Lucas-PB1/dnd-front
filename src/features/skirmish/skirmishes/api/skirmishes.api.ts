import { gameFetch } from "@/shared/api/dnd-api/api-client";
import {
  createSkirmishPayloadSchema,
  resolveSkirmishAttackPayloadSchema,
  skirmishAttackResultSchema,
  skirmishDetailSchema,
  skirmishSummaryListSchema,
  type CreateSkirmishPayload,
  type ResolveSkirmishAttackPayload,
  type SkirmishAttackResult,
  type SkirmishDetail,
  type SkirmishStatus,
  type SkirmishSummary,
} from "@/features/skirmish/skirmishes/api/skirmishes.schema";

export type {
  CreateSkirmishPayload,
  ResolveSkirmishAttackPayload,
  SkirmishAttackResult,
  SkirmishCombatant,
  SkirmishDetail,
  SkirmishStatus,
  SkirmishSummary,
  SkirmishWeaponOption,
} from "@/features/skirmish/skirmishes/api/skirmishes.schema";

export const skirmishesKeys = {
  all: ["skirmishes"] as const,
  detail: (id: string) => [...skirmishesKeys.all, "detail", id] as const,
};

export function skirmishStatusLabel(status: SkirmishStatus): string {
  switch (status) {
    case "active":
      return "Em combate";
    case "finished":
      return "Encerrado";
    default:
      return status;
  }
}

export async function fetchSkirmishes(accessToken: string) {
  const rows = await gameFetch<SkirmishSummary[]>("/skirmishes", accessToken);
  return skirmishSummaryListSchema.parse(rows);
}

export async function fetchSkirmishById(accessToken: string, id: string) {
  const row = await gameFetch<SkirmishDetail>(`/skirmishes/${id}`, accessToken);
  return skirmishDetailSchema.parse(row);
}

export async function createSkirmish(
  accessToken: string,
  payload: CreateSkirmishPayload,
) {
  const body = createSkirmishPayloadSchema.parse(payload);
  const row = await gameFetch<SkirmishDetail>("/skirmishes", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return skirmishDetailSchema.parse(row);
}

export async function attackInSkirmish(
  accessToken: string,
  skirmishId: string,
  payload: ResolveSkirmishAttackPayload,
) {
  const body = resolveSkirmishAttackPayloadSchema.parse(payload);
  const row = await gameFetch<SkirmishAttackResult>(
    `/skirmishes/${skirmishId}/attacks`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return skirmishAttackResultSchema.parse(row);
}

export async function endSkirmishTurn(accessToken: string, skirmishId: string) {
  const row = await gameFetch<SkirmishDetail>(
    `/skirmishes/${skirmishId}/end-turn`,
    accessToken,
    { method: "POST" },
  );
  return skirmishDetailSchema.parse(row);
}

export async function finishSkirmish(accessToken: string, skirmishId: string) {
  const row = await gameFetch<SkirmishDetail>(
    `/skirmishes/${skirmishId}/finish`,
    accessToken,
    { method: "POST" },
  );
  return skirmishDetailSchema.parse(row);
}

export async function deleteSkirmish(accessToken: string, skirmishId: string) {
  await gameFetch<void>(`/skirmishes/${skirmishId}`, accessToken, {
    method: "DELETE",
  });
}

export async function castInSkirmish(
  accessToken: string,
  skirmishId: string,
  payload: { spellSlug: string; slotLevel?: number },
) {
  const row = await gameFetch<SkirmishDetail>(
    `/skirmishes/${skirmishId}/cast`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return skirmishDetailSchema.parse(row);
}

export async function changeSkirmishCondition(
  accessToken: string,
  skirmishId: string,
  payload: {
    action: "add" | "remove";
    target: "self" | "opponent";
    condition: string;
  },
) {
  const row = await gameFetch<SkirmishDetail>(
    `/skirmishes/${skirmishId}/conditions`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return skirmishDetailSchema.parse(row);
}

export async function appendSkirmishLog(
  accessToken: string,
  skirmishId: string,
  text: string,
) {
  const row = await gameFetch<SkirmishDetail>(
    `/skirmishes/${skirmishId}/log`,
    accessToken,
    { method: "POST", body: JSON.stringify({ text }) },
  );
  return skirmishDetailSchema.parse(row);
}

export async function secondWindInSkirmish(
  accessToken: string,
  skirmishId: string,
) {
  const row = await gameFetch<SkirmishDetail>(
    `/skirmishes/${skirmishId}/second-wind`,
    accessToken,
    { method: "POST" },
  );
  return skirmishDetailSchema.parse(row);
}

export async function actionSurgeInSkirmish(
  accessToken: string,
  skirmishId: string,
) {
  const row = await gameFetch<SkirmishDetail>(
    `/skirmishes/${skirmishId}/action-surge`,
    accessToken,
    { method: "POST" },
  );
  return skirmishDetailSchema.parse(row);
}
