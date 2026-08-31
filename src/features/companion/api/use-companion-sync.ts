import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ActorSummary } from "@/entities/actor/types";
import { actorKeys } from "@/features/actor/api/use-actors";
import { syncCharacterCompanion } from "@/features/companion/api/companions.api";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

export function useSyncCharacterCompanion(characterId: string, loginNext: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useGameAuth(loginNext);

  return useMutation({
    mutationFn: async (restoreHp = false) => {
      if (!accessToken) throw new Error("Não autenticado");
      return syncCharacterCompanion(accessToken, characterId, { restoreHp });
    },
    onSuccess: (actor) => {
      void queryClient.invalidateQueries({
        queryKey: actorKeys.byCharacter(characterId),
      });
      void queryClient.invalidateQueries({
        queryKey: charactersKeys.detail(characterId),
      });
      if (actor.parentCharacterId) {
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
    return companions.find((actor) => actor.templateSlug === templateSlug) ?? companions[0];
  }
  return companions[0] ?? null;
}
