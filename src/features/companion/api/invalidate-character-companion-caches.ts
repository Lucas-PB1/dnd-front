import type { QueryClient } from "@tanstack/react-query";

import { actorKeys } from "@/features/actor/api/use-actors";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import { companionKeys } from "@/features/companion/api/companions.api";

export function invalidateCharacterCompanionCaches(
  queryClient: QueryClient,
  characterId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: companionKeys.list(characterId),
  });
  void queryClient.invalidateQueries({
    queryKey: actorKeys.byCharacter(characterId),
  });
  void queryClient.invalidateQueries({
    queryKey: charactersKeys.detail(characterId),
  });
  void queryClient.invalidateQueries({
    queryKey: sessionKeys.state(characterId),
  });
}
