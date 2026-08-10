"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeClericTableAction,
  type ClericTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatClericPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

/**
 * Clérigo: base/domínio pelo catálogo C010; pools ± só na Economia.
 */
export function CombatClericPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatClericPanelProps) {
  const enabled = classSlug === "cleric";
  const action = useTableActionMutation(characterId, executeClericTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "cleric",
        level,
        subclassSlug,
        section: "base",
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "cleric",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  if (!enabled) return null;

  const resources = state?.classResources ?? [];

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const actionsContent = (
    <div className="space-y-2">
      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        onAction={(slug) => action.mutate(slug as ClericTableActionSlug)}
      />
      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const powersContent =
    subclassActions.length > 0 ? (
      <div className="space-y-2">
        <CombatPanelActionButtons
          actions={subclassActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          onAction={(slug) => action.mutate(slug as ClericTableActionSlug)}
        />
        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Clérigo"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
