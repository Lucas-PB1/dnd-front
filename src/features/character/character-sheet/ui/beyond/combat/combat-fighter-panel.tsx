"use client";

import { useQuery } from "@tanstack/react-query";

import type { CharacterState } from "@/entities/character/session-types";
import {
  listBattleMasterManeuvers,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { FighterSubclassActions } from "@/features/character/character-sheet/ui/beyond/combat/fighter-subclass-actions";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";

type CombatFighterPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
  onTableNote?: (note: string) => void;
};

/**
 * Guerreiro na aba Ações: só poderes de subclasse (BM / Dungeoneer).
 * Fôlego / Surto / Mente Tática / psi → Usar na economia.
 * Ataques por ação → coluna de perícias. Indomável → salvaguardas.
 */
export function CombatFighterPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  onTableNote,
}: CombatFighterPanelProps) {
  const enabled = classSlug === "fighter";
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  const hasSubclassPowers =
    subclassSlug === "battle-master" || subclassSlug === "dungeoneer";

  const maneuversQuery = useQuery({
    queryKey: [...sessionKeys.state(characterId), "bm-maneuvers"],
    enabled: enabled && subclassSlug === "battle-master" && level >= 3,
    queryFn: async () => {
      try {
        return await listBattleMasterManeuvers(requireToken(), characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
  });

  if (!enabled) return null;
  if (!hasSubclassPowers || subclassSlug == null || level < 3) return null;

  return (
    <CombatClassPanelShell
      title="Guerreiro"
      actionsContent={null}
      powersContent={
        <FighterSubclassActions
          characterId={characterId}
          subclassSlug={subclassSlug}
          level={level}
          maneuvers={maneuversQuery.data}
          onResult={(result) => onTableNote?.(result.note)}
        />
      }
    />
  );
}
