"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeFighterTableAction,
  listBattleMasterManeuvers,
  sessionKeys,
  type FighterTableActionInput,
  type FighterTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { FighterSubclassActions } from "./fighter-subclass-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

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
 * Guerreiro: base/psi pelo catálogo C010/C019; BM/Dungeoneer com seletor na UI.
 * Indomável → salvaguardas. Ataques → coluna de perícias.
 */
export function CombatFighterPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
  onTableNote,
}: CombatFighterPanelProps) {
  const enabled = classSlug === "fighter";
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const action = useTableActionMutation(
    characterId,
    executeFighterTableAction,
  );
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "fighter",
        level,
        subclassSlug,
        section: "base",
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassCatalogActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "fighter",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  const showBmOrDungeon =
    (subclassSlug === "battle-master" || subclassSlug === "dungeoneer") &&
    level >= 3;

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

  const resources = state?.classResources ?? [];

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  function run(input: FighterTableActionInput) {
    action.mutate(input, {
      onSuccess: (result) => {
        if (result?.note) onTableNote?.(result.note);
      },
    });
  }

  const actionsContent = (
    <div className="space-y-2">
      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        size="xs"
        onAction={(slug) =>
          run({ actionSlug: slug as FighterTableActionSlug })
        }
      />
      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const powersContent =
    subclassCatalogActions.length > 0 || showBmOrDungeon ? (
      <div className="space-y-2">
        <CombatPanelActionButtons
          actions={subclassCatalogActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          onAction={(slug) =>
            run({ actionSlug: slug as FighterTableActionSlug })
          }
        />
        {showBmOrDungeon && subclassSlug != null ? (
          <FighterSubclassActions
            characterId={characterId}
            subclassSlug={subclassSlug}
            level={level}
            maneuvers={maneuversQuery.data}
            onResult={(result) => onTableNote?.(result.note)}
          />
        ) : null}
        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Guerreiro"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
