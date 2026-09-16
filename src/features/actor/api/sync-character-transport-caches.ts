import type { QueryClient } from "@tanstack/react-query";

import { actorKeys } from "@/features/actor/api/use-actors";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import { charactersKeys } from "@/features/character/characters/api/characters.api";

type SessionWithBoarded = {
  boardedActorId?: string | null;
};

export function syncCharacterTransportCaches(
  queryClient: QueryClient,
  characterId: string,
  boardedActorId: string | null,
  actorId?: string | null,
) {
  queryClient.setQueryData(
    sessionKeys.state(characterId),
    (prev: SessionWithBoarded | undefined) =>
      prev ? { ...prev, boardedActorId } : prev,
  );
  void queryClient.invalidateQueries({
    queryKey: sessionKeys.state(characterId),
  });
  void queryClient.invalidateQueries({
    queryKey: actorKeys.byCharacter(characterId),
  });
  void queryClient.invalidateQueries({
    queryKey: charactersKeys.detail(characterId),
  });
  if (actorId) {
    void queryClient.invalidateQueries({
      queryKey: actorKeys.detail(actorId),
    });
  }
}
