"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeDruidTableAction,
  type DruidTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { CombatResourceSummary } from "../shared/resource-summary";
import { TableActionFeedback } from "../shared/table-action-feedback";

type CombatDruidPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

function isWildShapeSlug(slug: string): boolean {
  return slug === "wildShape" || slug === "wild-shape";
}

export function CombatDruidPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatDruidPanelProps) {
  const action = useTableActionMutation(characterId, executeDruidTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({ classSlug, subclassSlug });
  const panelCatalog = mechanicalCatalog.data?.panelActions ?? [];

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "druid",
        level,
        subclassSlug,
        section: "base",
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "druid",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  if (classSlug !== "druid") return null;

  const resources = state?.classResources ?? [];
  const wildShapeResource = resources.find((item) =>
    isWildShapeSlug(item.slug),
  );
  const wildShapeRemaining = wildShapeResource?.remaining ?? 0;

  function getRemaining(slug: string): number | null {
    if (isWildShapeSlug(slug)) return wildShapeRemaining;
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={["wildShape", "wild-shape"]}
      />

      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        variant="outline"
        showRemaining={false}
        onAction={(slug) => action.mutate(slug as DruidTableActionSlug)}
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
          variant="default"
          showRemaining={false}
          onAction={(slug) => action.mutate(slug as DruidTableActionSlug)}
        />

        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Combate do Druida (Forma Selvagem)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
