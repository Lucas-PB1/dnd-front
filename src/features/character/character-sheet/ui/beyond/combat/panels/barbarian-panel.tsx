"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { SubclassOptionPick } from "@/entities/companion/lib/companion-profiles";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeBarbarianTableAction,
  type BarbarianTableActionSlug,
  type CompanionCommandSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CompanionTrackerPanel } from "@/features/companion/ui/companion-tracker-panel";
import { BarbarianCombatToggles } from "./barbarian-combat-toggles";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";

const RAGE_TOGGLE_SLUGS = new Set(["toggle-rage", "toggle-reckless"]);

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatBarbarianPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  subclassOptions?: readonly SubclassOptionPick[];
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
  onTableNote?: (note: string) => void;
};

function isRageSlug(slug: string): boolean {
  return slug === "rage";
}

/**
 * Bárbaro: Fúria/Imprudente e poderes de trilha via C010; pool de Fúria ± na Economia.
 */
export function CombatBarbarianPanel({
  characterId,
  classSlug,
  subclassSlug,
  subclassOptions = [],
  level,
  combatNotes,
  state,
  onTableNote,
}: CombatBarbarianPanelProps) {
  const enabled = classSlug === "barbarian";
  const action = useTableActionMutation(characterId, executeBarbarianTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "barbarian",
        level,
        subclassSlug,
        section: "base",
      }).filter((entry) => !RAGE_TOGGLE_SLUGS.has(entry.slug)),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "barbarian",
        level,
        subclassSlug,
        section: "subclass",
      }).filter(
        (entry) =>
          !entry.slug.startsWith("primal-companion"),
      ),
    [panelCatalog, level, subclassSlug],
  );

  const isPrimalSpirit =
    subclassSlug === "pathofthe-primal-spirit" && level >= 3;

  if (!enabled) return null;

  const resources = state?.classResources ?? [];

  function getRemaining(slug: string): number | null {
    if (isRageSlug(slug)) {
      return resources.find((item) => isRageSlug(item.slug))?.remaining ?? null;
    }
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const actionsContent = (
    <div className="space-y-2">
      <BarbarianCombatToggles
        characterId={characterId}
        level={level}
        state={state}
        onNote={onTableNote}
      />
      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        disabled={!state}
        onAction={(slug) =>
          action.mutate({ actionSlug: slug as BarbarianTableActionSlug })
        }
      />
      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  function runSubclass(
    slug: string,
    companionCommand?: CompanionCommandSlug,
    diceCount?: number,
  ) {
    action.mutate({
      actionSlug: slug as BarbarianTableActionSlug,
      ...(companionCommand ? { companionCommand } : {}),
      ...(diceCount != null ? { diceCount } : {}),
    });
  }

  const primalSpiritContent = isPrimalSpirit ? (
    <CompanionTrackerPanel
      characterId={characterId}
      subclassSlug={subclassSlug}
      subclassOptions={subclassOptions}
      level={level}
      isTableActionPending={action.isPending}
      lastNote={action.lastResult?.note}
      onCommand={(command) => runSubclass("primal-companion", command)}
    />
  ) : null;

  const powersContent =
    subclassActions.length > 0 || primalSpiritContent ? (
      <div className="space-y-2">
        {primalSpiritContent}
        <CombatPanelActionButtons
          actions={subclassActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          disabled={!state}
          onAction={(slug) => runSubclass(slug)}
        />
        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Bárbaro"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
