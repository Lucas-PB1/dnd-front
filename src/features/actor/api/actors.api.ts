import { gameFetch } from "@/shared/api/dnd-api/api-client";
import type { ActorSummary } from "@/entities/actor/types";

export async function fetchActors(accessToken: string) {
  return gameFetch<ActorSummary[]>("/actors", accessToken);
}
