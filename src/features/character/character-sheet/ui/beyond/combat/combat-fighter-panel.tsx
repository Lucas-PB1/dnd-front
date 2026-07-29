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
  const [mindCheck, setMindCheck] = useState("10");
  const [mindDc, setMindDc] = useState("15");

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
        return await applyTacticalMind(
          requireToken(),
          characterId,
          Number(mindCheck) || 0,
          Number(mindDc) || 0,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.setQueryData(sessionKeys.state(characterId), result.state);
      setLastNote(
        `${result.note} (${result.expression}=${result.roll} → total ${result.newTotal})`,
      );
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

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Guerreiro
      </p>
      {attacksPerAction != null ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Ataques por ação:{" "}
          <span className="font-semibold text-foreground">
            {attacksPerAction}
          </span>
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2">
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
      </div>

      {level >= 2 ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-[0.7rem] text-muted-foreground">
            Teste
            <input
              className="ml-1 w-14 rounded border border-border/70 bg-background px-1 py-0.5 font-mono text-sm"
              value={mindCheck}
              onChange={(event) => setMindCheck(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <label className="text-[0.7rem] text-muted-foreground">
            CD
            <input
              className="ml-1 w-14 rounded border border-border/70 bg-background px-1 py-0.5 font-mono text-sm"
              value={mindDc}
              onChange={(event) => setMindDc(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={busy || !state || (secondWind?.remaining ?? 0) <= 0}
            title="Mente Tática: +1d10; gasta Recuperar Fôlego só se virar sucesso"
            onClick={() => mindMutation.mutate()}
          >
            Mente Tática
          </Button>
        </div>
      ) : null}

      {indomitable ? (
        <p className="mt-2 text-[0.7rem] text-muted-foreground">
          Indomável: {indomitable.remaining}/{indomitable.max} — use na
          salvaguarda com a opção Indomável.
        </p>
      ) : null}

      <FighterSubclassActions
        characterId={characterId}
        subclassSlug={subclassSlug}
        level={level}
        maneuvers={maneuversQuery.data}
        onResult={(result) => setLastNote(result.note)}
      />

      {combatNotes && combatNotes.length > 0 ? (
        <ul className="mt-2 space-y-1 text-[0.7rem] text-muted-foreground">
          {combatNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      {lastNote ? (
        <p className="mt-2 text-sm text-secondary" role="status">
          {lastNote}
        </p>
      ) : null}
      {mutationError ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : "Não foi possível executar a ação"}
        </p>
      ) : null}
    </div>
  );
}
