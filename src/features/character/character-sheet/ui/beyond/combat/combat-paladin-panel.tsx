"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executePaladinTableAction,
  sessionKeys,
  type FighterTableActionResult,
  type PaladinTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { Button } from "@/shared/ui/button";

type CombatPaladinPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type ChannelAction = {
  slug: PaladinTableActionSlug;
  label: string;
  minLevel: number;
};

const CHANNEL_ACTIONS: readonly ChannelAction[] = [
  { slug: "divine-sense", label: "Sentido Divino", minLevel: 3 },
  { slug: "oath-channel", label: "Canalizar do Juramento", minLevel: 3 },
  { slug: "abjure-enemies", label: "Repudiar Inimigos", minLevel: 9 },
];

export function CombatPaladinPanel({
  characterId,
  classSlug,
  level,
  combatNotes,
  state,
}: CombatPaladinPanelProps) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] =
    useState<FighterTableActionResult | null>(null);
  const [healAmount, setHealAmount] = useState(1);

  const action = useMutation({
    mutationFn: async (payload: {
      actionSlug: PaladinTableActionSlug;
      amount?: number;
    }) => {
      try {
        return await executePaladinTableAction(
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
      setLastResult(result);
    },
  });

  if (classSlug !== "paladin") return null;

  const layOnHands = state?.classResources?.find(
    (item) => item.slug === "layOnHands",
  );
  const channel = state?.classResources?.find(
    (item) => item.slug === "channelDivinity",
  );
  const poolRemaining = layOnHands?.remaining ?? 0;
  const channelRemaining = channel?.remaining ?? 0;

  const channelActions = CHANNEL_ACTIONS.filter(
    (item) => level >= item.minLevel,
  );

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Paladino
      </p>

      {layOnHands ? (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            Mãos Consagradas:{" "}
            <span className="font-semibold text-foreground">
              {poolRemaining}/{layOnHands.max} PV
            </span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={1}
              max={Math.max(1, poolRemaining)}
              value={healAmount}
              onChange={(event) =>
                setHealAmount(Math.max(1, Number(event.target.value) || 1))
              }
              className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm"
              aria-label="Pontos de cura das Mãos Consagradas"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={action.isPending || poolRemaining < healAmount}
              onClick={() =>
                action.mutate({ actionSlug: "lay-on-hands", amount: healAmount })
              }
            >
              Curar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={action.isPending || poolRemaining < 5}
              onClick={() => action.mutate({ actionSlug: "cure-poison" })}
            >
              Curar Veneno (5)
            </Button>
          </div>
        </div>
      ) : null}

      {channel ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Canalizar Divindade:{" "}
          <span className="font-semibold text-foreground">
            {channelRemaining}/{channel.max}
          </span>
        </p>
      ) : null}

      {channelActions.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {channelActions.map((item) => (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant="outline"
              disabled={action.isPending || channelRemaining <= 0}
              onClick={() => action.mutate({ actionSlug: item.slug })}
            >
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}

      {combatNotes?.length ? (
        <ul className="mt-2 space-y-1 text-[0.7rem] text-muted-foreground">
          {combatNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      {lastResult ? (
        <p className="mt-2 text-sm text-secondary" role="status">
          {lastResult.note}
        </p>
      ) : null}
      {action.error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {action.error instanceof Error
            ? action.error.message
            : "Não foi possível executar a ação"}
        </p>
      ) : null}
    </div>
  );
}
