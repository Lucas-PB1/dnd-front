"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeBarbarianTableAction,
  type BarbarianTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatBarbarianPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
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
  level,
  combatNotes,
  state,
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
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "barbarian",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  if (!enabled) return null;

  const resources = state?.classResources ?? [];
  const rageActive = state?.rageActive ?? false;
  const recklessActive = state?.recklessActive ?? false;

  function getRemaining(slug: string): number | null {
    if (isRageSlug(slug)) {
      return resources.find((item) => isRageSlug(item.slug))?.remaining ?? null;
    }
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const statusLine = (
    <p className="text-sm text-muted-foreground">
      Fúria:{" "}
      <span className="font-medium text-foreground">
        {rageActive ? "ativa" : "inativa"}
      </span>
      {" · "}
      Imprudente:{" "}
      <span className="font-medium text-foreground">
        {recklessActive ? "ativo" : "inativo"}
      </span>
    </p>
  );

  const actionsContent = (
    <div className="space-y-2">
      {statusLine}
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

  const powersContent =
    subclassActions.length > 0 ? (
      <div className="space-y-2">
        <CombatPanelActionButtons
          actions={subclassActions}
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
