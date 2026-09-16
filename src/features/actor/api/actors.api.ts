import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type {
  ActorDetail,
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
