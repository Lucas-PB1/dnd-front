import type { ActorDetail, ActorLiveState } from "@/entities/actor/types";

export function resolveActorVitals(
  actor: ActorDetail,
  live: ActorLiveState | undefined,
) {
  return {
    hitPointsCurrent:
      live?.hitPointsCurrent ?? actor.hitPointsCurrent ?? actor.hitPointsMax ?? 0,
    hitPointsMax: live?.hitPointsMax ?? actor.hitPointsMax,
    armorClass: live?.armorClass ?? actor.armorClass,
    tempHp: live?.tempHp ?? actor.state?.tempHp ?? 0,
    conditions: live?.conditions ?? actor.state?.conditions ?? [],
  };
}
