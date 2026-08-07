"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { UseManeuverResult } from "@/entities/character/session-types";
import {
  executeGunslingerManeuver,
  listManeuvers,
  recoverRisk,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { Button } from "@/shared/ui/button";

type CombatManeuversPanelProps = {
  characterId: string;
  classSlug: string;
  level: number;
};

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

  const useMutationManeuver = useMutation({
    mutationFn: async (maneuverSlug: string) => {
      try {
        return await executeGunslingerManeuver(
          requireToken(),
          characterId,
          maneuverSlug,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      setLastResult(result);
      queryClient.setQueryData(sessionKeys.state(characterId), result.state);
    },
  });

  if (!enabled) return null;

  const maneuvers = maneuversQuery.data ?? [];
  if (maneuvers.length === 0 && !maneuversQuery.isPending) return null;

  const actionsContent = (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {maneuvers.map((maneuver) => (
          <Button
            key={maneuver.slug}
            type="button"
            size="xs"
            variant="outline"
            disabled={useMutationManeuver.isPending}
            title={maneuver.description}
            onClick={() => useMutationManeuver.mutate(maneuver.slug)}
          >
            {maneuver.name}
          </Button>
        ))}
      </div>

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

      {useMutationManeuver.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {useMutationManeuver.error instanceof Error
            ? useMutationManeuver.error.message
            : "Não foi possível usar a manobra"}
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

/** Hook auxiliar para Gambito Terrível no painel de recursos. */
export function useRecoverRisk(characterId: string) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        return await recoverRisk(requireToken(), characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (state) => {
      if (!state) return;
      queryClient.setQueryData(sessionKeys.state(characterId), state);
    },
  });
}
