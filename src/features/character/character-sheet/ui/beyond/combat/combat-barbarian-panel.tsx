"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CharacterState } from "@/entities/character/session-types";
import {
  sessionKeys,
  toggleRage,
  toggleReckless,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { Button } from "@/shared/ui/button";

type CombatBarbarianPanelProps = {
  characterId: string;
  classSlug: string;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

export function CombatBarbarianPanel({
  characterId,
  classSlug,
  combatNotes,
  state,
}: CombatBarbarianPanelProps) {
  const enabled = classSlug === "barbarian";
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

  const rageMutation = useMutation({
    mutationFn: async (active?: boolean) => {
      try {
        return await toggleRage(requireToken(), characterId, active);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (next) => {
      if (next) queryClient.setQueryData(sessionKeys.state(characterId), next);
    },
  });

  const recklessMutation = useMutation({
    mutationFn: async (active?: boolean) => {
      try {
        return await toggleReckless(requireToken(), characterId, active);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: (next) => {
      if (next) queryClient.setQueryData(sessionKeys.state(characterId), next);
    },
  });

  if (!enabled) return null;

  const rageActive = state?.rageActive ?? false;
  const recklessActive = state?.recklessActive ?? false;
  const busy = rageMutation.isPending || recklessMutation.isPending;
  const mutationError = rageMutation.error ?? recklessMutation.error;

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Bárbaro
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={rageActive ? "default" : "outline"}
          disabled={busy || !state}
          title={
            rageActive
              ? "Encerrar a Fúria"
              : "Entrar em Fúria (gasta 1 uso de Fúria)"
          }
          onClick={() => rageMutation.mutate(!rageActive)}
        >
          {rageActive ? "Fúria ativa" : "Entrar em Fúria"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={recklessActive ? "default" : "outline"}
          disabled={busy || !state}
          title="Ataque Imprudente: vantagem em ataques corpo a corpo com Força; ataques contra você têm vantagem"
          onClick={() => recklessMutation.mutate(!recklessActive)}
        >
          {recklessActive ? "Imprudente ativo" : "Ataque Imprudente"}
        </Button>
      </div>
      {combatNotes && combatNotes.length > 0 ? (
        <ul className="mt-2 space-y-1 text-[0.7rem] text-muted-foreground">
          {combatNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      {mutationError ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : "Não foi possível atualizar o estado de combate"}
        </p>
      ) : null}
    </div>
  );
}
