import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  ActorAttackRollPayload,
  ActorAttackRollResult,
  ActorDetail,
  ActorLiveState,
  ActorSummary,
  CreateActorPayload,
} from "@/entities/actor/types";

export async function fetchActors(accessToken: string) {
  return gameFetch<ActorSummary[]>("/actors", accessToken);
}

export async function createActor(
  accessToken: string,
  payload: CreateActorPayload,
) {
  return gameFetch<ActorDetail>("/actors", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteActor(accessToken: string, id: string) {
  return gameFetch<void>(`/actors/${id}`, accessToken, {
    method: "DELETE",
  });
}

export async function fetchActorState(accessToken: string, id: string) {
  return gameFetch<ActorLiveState>(`/actors/${id}/state`, accessToken);
}

export async function rollActorAttack(
  accessToken: string,
  actorId: string,
  payload: ActorAttackRollPayload,
) {
  return gameFetch<ActorAttackRollResult>(
    `/actors/${actorId}/rolls/attack`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
