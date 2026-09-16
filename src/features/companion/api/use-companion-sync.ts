import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ActorSummary } from "@/entities/actor/types";
import { actorKeys } from "@/features/actor/api/use-actors";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { syncCharacterCompanion } from "@/features/companion/api/companions.api";
import { invalidateCharacterCompanionCaches } from "@/features/companion/api/invalidate-character-companion-caches";

export function useSyncCharacterCompanion(characterId: string, loginNext: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useGameAuth(loginNext);

  return useMutation({
    mutationFn: async (restoreHp: boolean) => {
      if (!accessToken) throw new Error("Não autenticado");
      return syncCharacterCompanion(accessToken, characterId, { restoreHp });
    },
    onSuccess: (actor) => {
      invalidateCharacterCompanionCaches(queryClient, characterId);
      if (
        actor.parentCharacterId &&
        actor.parentCharacterId !== characterId
      ) {
        void queryClient.invalidateQueries({
          queryKey: actorKeys.byCharacter(actor.parentCharacterId),
        });
      }
    },
  });
}

export function pickCompanionActor(
  actors: ActorSummary[] | undefined,
  templateSlug: string | null,
): ActorSummary | null {
  if (!actors?.length) return null;
  const companions = actors.filter((actor) => actor.actorKind === "companion");
  if (!companions.length) return null;
  if (templateSlug) {
    return (
      companions.find((actor) => actor.templateSlug === templateSlug) ??
      companions[0]
    );
  }
  return companions[0] ?? null;
}
