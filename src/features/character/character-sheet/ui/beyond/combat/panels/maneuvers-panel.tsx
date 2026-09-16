"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { CharacterState, UseManeuverResult } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeGunslingerTableAction,
  listManeuvers,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { economyActionDetailText } from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { gunslingerPanelReminders } from "@/features/character/character-sheet/lib/combat/gunslinger-panel-reminders";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { FeatureDetailTrigger } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import {
  CombatPanelActionList,
  CombatPanelActionRow,
} from "../shared/panel-action-row";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatManeuversPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  state: CharacterState | undefined;
};

function isManeuverResult(
  result: Awaited<ReturnType<typeof executeGunslingerTableAction>>,
): result is UseManeuverResult {
  return "maneuverName" in result && "riskRoll" in result;
}

export function CombatManeuversPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  state,
}: CombatManeuversPanelProps) {
  const enabled = classSlug === "gunslinger" && level >= 2;
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<UseManeuverResult | null>(null);
  const [tableNote, setTableNote] = useState<string | null>(null);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug: "gunslinger",
    subclassSlug,
  });
  const panelActions =
    resolvePanelActions(mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS, {
      classSlug: "gunslinger",
      level,
      subclassSlug,
    }) ?? EMPTY_PANEL_ACTIONS;
  const reminders = useMemo(
    () =>
      gunslingerPanelReminders(mechanicalCatalog.data?.economyActions ?? [], {
        level,
        subclassSlug,
      }),
    [mechanicalCatalog.data?.economyActions, level, subclassSlug],
  );
  const risk = state?.classResources?.find((item) => item.slug === "risk");

  const maneuversQuery = useQuery({
    queryKey: [...sessionKeys.state(characterId), "maneuvers"],
    enabled,
    queryFn: async () => {
      try {
        return await listManeuvers(requireToken(), characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
  });

  const tableAction = useMutation({
    mutationFn: async (payload: {
      actionSlug: "use-maneuver" | "recover-risk";
      maneuverSlug?: string;
    }) => {
      try {
        return await executeGunslingerTableAction(
          requireToken(),
          characterId,
          payload,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.setQueryData(sessionKeys.state(characterId), result.state);
      if (isManeuverResult(result)) {
        setLastResult(result);
        setTableNote(null);
      } else {
        setTableNote(result.note);
      }
    },
  });

  if (classSlug !== "gunslinger") return null;

  const maneuvers = maneuversQuery.data ?? [];
  if (!enabled && reminders.length === 0 && !risk) {
    return null;
  }
  if (
    enabled &&
    maneuvers.length === 0 &&
    !maneuversQuery.isPending &&
    panelActions.length === 0 &&
    reminders.length === 0 &&
    !risk
  ) {
    return null;
  }

  const busy = tableAction.isPending;
  const actionsContent = (
    <div className="space-y-2">
      {risk ? (
        <p className="text-sm text-muted-foreground">
          Dados de Risco:{" "}
          <span className="font-semibold text-foreground">
            {risk.remaining}/{risk.max}
          </span>
        </p>
      ) : null}
      {enabled ? (
      <CombatPanelActionList
        title="Manobras"
        count={maneuvers.length + panelActions.length}
      >
        {maneuvers.map((maneuver) => (
          <CombatPanelActionRow
            key={maneuver.slug}
            name={maneuver.name}
            description={maneuver.description}
            disabled={busy}
            pending={busy}
            onAction={() =>
              tableAction.mutate({
                actionSlug: "use-maneuver",
                maneuverSlug: maneuver.slug,
              })
            }
          />
        ))}
        {panelActions.map((action) => (
          <CombatPanelActionRow
            key={action.panelKey}
            name={action.name}
            description={action.description?.trim() || action.title?.trim() || null}
            variant="secondary"
            disabled={busy}
            pending={busy}
            onAction={() =>
              tableAction.mutate({
                actionSlug: action.slug as "recover-risk",
              })
            }
          />
        ))}
      </CombatPanelActionList>
      ) : null}

      {reminders.length > 0 ? (
        <ul className="space-y-2">
          {reminders.map((reminder) => (
            <li
              key={reminder.id}
              className="rounded-md border border-border/60 bg-muted/20 px-2.5 py-2"
            >
              {economyActionDetailText(reminder) ? (
                <FeatureDetailTrigger
                  variant="text"
                  title={reminder.name}
                  subtitle={reminder.summary}
                  description={economyActionDetailText(reminder)}
                >
                  <span className="text-sm font-medium text-foreground underline-offset-2 hover:underline">
                    {reminder.name}
                  </span>
                  {reminder.summary ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {reminder.summary}
                    </span>
                  ) : null}
                </FeatureDetailTrigger>
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {reminder.name}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {lastResult ? (
        <div className="space-y-1 text-sm" role="status">
          <p className="text-secondary">
            {lastResult.maneuverName}: {lastResult.riskRoll.expression} →{" "}
            <strong>{lastResult.riskRoll.value}</strong>
          </p>
          <p className="text-muted-foreground">{lastResult.note}</p>
          {lastResult.tempHpGained != null ? (
            <p>+{lastResult.tempHpGained} PV temporários</p>
          ) : null}
          {lastResult.missDamage != null ? (
            <p>Dano no erro: {lastResult.missDamage}</p>
          ) : null}
          {lastResult.acBonus != null ? (
            <p>+{lastResult.acBonus} CA até o início do próximo turno</p>
          ) : null}
          {lastResult.checkBonus != null ? (
            <p>+{lastResult.checkBonus} no teste</p>
          ) : null}
        </div>
      ) : null}

      {tableNote ? (
        <p className="text-sm text-secondary" role="status">
          {tableNote}
        </p>
      ) : null}

      {tableAction.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {tableAction.error instanceof Error
            ? tableAction.error.message
            : "Não foi possível executar a ação"}
        </p>
      ) : null}
    </div>
  );

  return (
    <CombatClassPanelShell
      title="Pistoleiro"
      actionsContent={actionsContent}
    />
  );
}
