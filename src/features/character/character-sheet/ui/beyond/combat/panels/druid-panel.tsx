"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeDruidTableAction,
  type DruidTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import {
  filterStarryFormPanelActions,
  stellarConstellationDisplayLabel,
} from "@/features/character/character-sheet/lib/combat/filter-starry-form-actions";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatDruidPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

/**
 * Druida: Ressurgimento + poderes de círculo via C010; pool Forma Selvagem ± só na Economia.
 * Forma de besta (seletor/ficha) = polish futuro.
 */
export function CombatDruidPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatDruidPanelProps) {
  const enabled = classSlug === "druid";
  const action = useTableActionMutation(characterId, executeDruidTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;

  const starryFormState = useMemo(
    () => ({
      starryFormActive: state?.starryFormActive ?? false,
      stellarConstellation: state?.stellarConstellation ?? null,
    }),
    [state?.starryFormActive, state?.stellarConstellation],
  );

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
      filterStarryFormPanelActions(
        resolvePanelActions(panelCatalog, {
          classSlug: "druid",
          level,
          subclassSlug,
          section: "subclass",
        }),
        starryFormState,
      ),
    [panelCatalog, level, subclassSlug, starryFormState],
  );

  if (!enabled) return null;

  const resources = state?.classResources ?? [];
  const constellationLabel = stellarConstellationDisplayLabel(
    starryFormState.stellarConstellation,
  );

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const statusLine =
    subclassSlug === "stars" ? (
      <p className="text-sm text-muted-foreground">
        Forma Estelar:{" "}
        <span className="font-medium text-foreground">
          {starryFormState.starryFormActive && constellationLabel
            ? `ativa (${constellationLabel})`
            : "inativa"}
        </span>
      </p>
    ) : null;

  const actionsContent = (
    <div className="space-y-2">
      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        disabled={!state}
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
        {statusLine}
        <CombatPanelActionButtons
          actions={subclassActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          disabled={!state}
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
      title="Druida"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
