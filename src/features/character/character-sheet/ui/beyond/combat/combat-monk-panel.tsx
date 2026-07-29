"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeMonkTableAction,
  sessionKeys,
  type FighterTableActionResult,
  type MonkTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { Button } from "@/shared/ui/button";

type CombatMonkPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type MonkAction = {
  slug: MonkTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  spendsFocus: boolean;
};

const MONK_ACTIONS: readonly MonkAction[] = [
  { slug: "flurry-of-blows", label: "Torrente de Golpes", minLevel: 2, spendsFocus: true },
  { slug: "patient-defense", label: "Defesa Paciente", minLevel: 2, spendsFocus: true },
  { slug: "step-of-the-wind", label: "Passo do Vento", minLevel: 2, spendsFocus: true },
  { slug: "stunning-strike", label: "Golpe Atordoante", minLevel: 5, spendsFocus: true },
  {
    slug: "open-hand-technique",
    label: "Técnica da Mão Espalmada",
    minLevel: 3,
    subclass: "open-hand",
    spendsFocus: false,
  },
  {
    slug: "elemental-blast",
    label: "Explosão Elemental",
    minLevel: 3,
    subclass: "elements",
    spendsFocus: true,
  },
  {
    slug: "hand-of-healing",
    label: "Mão de Cura",
    minLevel: 3,
    subclass: "mercy",
    spendsFocus: true,
  },
  {
    slug: "hand-of-harm",
    label: "Mão de Dolo",
    minLevel: 3,
    subclass: "mercy",
    spendsFocus: true,
  },
  {
    slug: "shadow-step",
    label: "Passo da Sombra",
    minLevel: 6,
    subclass: "shadow",
    spendsFocus: false,
  },
];

export function CombatMonkPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatMonkPanelProps) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] =
    useState<FighterTableActionResult | null>(null);

  const action = useMutation({
    mutationFn: async (actionSlug: MonkTableActionSlug) => {
      try {
        return await executeMonkTableAction(
          requireToken(),
          characterId,
          actionSlug,
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

  if (classSlug !== "monk") return null;

  const focus = state?.classResources?.find(
    (item) => item.slug === "focusPoints",
  );
  const focusRemaining = focus?.remaining ?? 0;

  const available = MONK_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Monge
      </p>
      {focus ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Pontos de Foco:{" "}
          <span className="font-semibold text-foreground">
            {focusRemaining}/{focus.max}
          </span>
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2">
        {available.map((item) => (
          <Button
            key={item.slug}
            type="button"
            size="sm"
            variant={item.spendsFocus ? "outline" : "ghost"}
            disabled={
              action.isPending || (item.spendsFocus && focusRemaining <= 0)
            }
            onClick={() => action.mutate(item.slug)}
          >
            {item.label}
          </Button>
        ))}
      </div>

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
