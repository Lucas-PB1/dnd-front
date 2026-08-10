"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { UseManeuverResult } from "@/entities/character/session-types";
import {
  executeGunslingerTableAction,
  listManeuvers,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import {
  CombatPanelActionList,
  CombatPanelActionRow,
} from "../shared/panel-action-row";

const EMPTY_PANEL_ACTIONS: never[] = [];

type CombatManeuversPanelProps = {
  characterId: string;
  classSlug: string;
  level: number;
};

function isManeuverResult(
  result: Awaited<ReturnType<typeof executeGunslingerTableAction>>,
): result is UseManeuverResult {
  return "maneuverName" in result && "riskRoll" in result;
}

export function CombatManeuversPanel({
  characterId,
  classSlug,
  level,
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
  });
  const panelActions =
    resolvePanelActions(mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS, {
      classSlug: "gunslinger",
      level,
    }) ?? EMPTY_PANEL_ACTIONS;

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

  if (!enabled) return null;

  const maneuvers = maneuversQuery.data ?? [];
  if (maneuvers.length === 0 && !maneuversQuery.isPending && panelActions.length === 0) {
    return null;
  }

  const busy = tableAction.isPending;
  const actionsContent = (
    <div className="space-y-2">
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
      title="Manobras de Risco"
      actionsContent={actionsContent}
    />
  );
}
