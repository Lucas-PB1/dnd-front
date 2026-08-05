"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  listBattleMasterManeuvers,
  sessionKeys,
  activateActionSurge,
  activateSecondWind,
  applyTacticalMind,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { FighterSubclassActions } from "@/features/character/character-sheet/ui/beyond/combat/fighter-subclass-actions";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
import { Button } from "@/shared/ui/button";

type CombatFighterPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  attacksPerAction?: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

export function CombatFighterPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  attacksPerAction,
  combatNotes,
  state,
}: CombatFighterPanelProps) {
  const enabled = classSlug === "fighter";
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();
  const [lastNote, setLastNote] = useState<string | null>(null);

  const secondWindMutation = useMutation({
    mutationFn: async () => {
      try {
        return await activateSecondWind(requireToken(), characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.setQueryData(sessionKeys.state(characterId), result.state);
      setLastNote(
        `Recuperar Fôlego: ${result.expression} → +${result.healAmount} PV` +
          (result.note ? ` · ${result.note}` : ""),
      );
    },
  });

  const surgeMutation = useMutation({
    mutationFn: async () => {
      try {
        return await activateActionSurge(requireToken(), characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.setQueryData(sessionKeys.state(characterId), result.state);
      setLastNote(result.note);
    },
  });

  const mindMutation = useMutation({
    mutationFn: async () => {
      try {
        return await applyTacticalMind(requireToken(), characterId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.setQueryData(sessionKeys.state(characterId), result.state);
      setLastNote(result.note);
    },
  });

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

  const busy =
    secondWindMutation.isPending ||
    surgeMutation.isPending ||
    mindMutation.isPending;
  const mutationError =
    secondWindMutation.error ?? surgeMutation.error ?? mindMutation.error;
  const secondWind = state?.classResources?.find(
    (resource) => resource.slug === "secondWind",
  );
  const actionSurge = state?.classResources?.find(
    (resource) => resource.slug === "actionSurge",
  );
  const indomitable = state?.classResources?.find(
    (resource) => resource.slug === "indomitable",
  );

  /* ── Tab: Ações Principais ── */
  const actionsContent = (
    <div className="space-y-2">
      {attacksPerAction != null ? (
        <p className="text-sm text-muted-foreground">
          Ataques por ação:{" "}
          <span className="font-semibold text-foreground">
            {attacksPerAction}
          </span>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !state || (secondWind?.remaining ?? 0) <= 0}
          title="Ação Bônus: cura 1d10 + nível"
          onClick={() => secondWindMutation.mutate()}
        >
          Recuperar Fôlego
          {secondWind ? ` (${secondWind.remaining})` : ""}
        </Button>
        {level >= 2 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !state || (actionSurge?.remaining ?? 0) <= 0}
            onClick={() => surgeMutation.mutate()}
          >
            Surto de Ação
            {actionSurge ? ` (${actionSurge.remaining})` : ""}
          </Button>
        ) : null}
        {level >= 2 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !state || (secondWind?.remaining ?? 0) <= 0}
            title="Gasta 1 Recuperar Fôlego e rola +1d10 no teste. Se ainda falhar, devolva o uso."
            onClick={() => mindMutation.mutate()}
          >
            Mente Tática
            {secondWind ? ` (${secondWind.remaining})` : ""}
          </Button>
        ) : null}
      </div>

      {indomitable ? (
        <p className="text-[0.7rem] text-muted-foreground">
          Indomável: {indomitable.remaining}/{indomitable.max} — use na
          salvaguarda com a opção Indomável.
        </p>
      ) : null}

      {lastNote ? (
        <p className="text-sm text-secondary" role="status">
          {lastNote}
        </p>
      ) : null}
      {mutationError ? (
        <p className="text-sm text-destructive" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : "Não foi possível executar a ação"}
        </p>
      ) : null}
    </div>
  );

  /* ── Tab: Subclasse / Poderes ── */
  const hasSubclassContent = subclassSlug != null && level >= 3;
  const powersContent = hasSubclassContent ? (
    <FighterSubclassActions
      characterId={characterId}
      subclassSlug={subclassSlug}
      level={level}
      maneuvers={maneuversQuery.data}
      onResult={(result) => setLastNote(result.note)}
    />
  ) : null;

  return (
    <CombatClassPanelShell
      title="Combate do Guerreiro"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
      powersIcon="🧠"
    />
  );
}
