"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  type BattleMasterManeuver,
  type FighterTableActionResult,
  type PsiWarriorActionSlug,
  castDungeonPrecaution,
  executeBattleMasterManeuver,
  executePsiWarriorAction,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { Button } from "@/shared/ui/button";

type FighterSubclassActionsProps = {
  characterId: string;
  subclassSlug?: string | null;
  level: number;
  maneuvers?: BattleMasterManeuver[];
  onResult: (result: FighterTableActionResult) => void;
};

const PSI_ACTIONS: Array<{
  slug: PsiWarriorActionSlug;
  name: string;
  level: number;
}> = [
  { slug: "protective-field", name: "Campo Protetor", level: 3 },
  {
    slug: "telekinetic-movement",
    name: "Movimento Telecinético",
    level: 3,
  },
  {
    slug: "psychic-leap",
    name: "Salto Psíquico",
    level: 7,
  },
  { slug: "mental-guard", name: "Resguardo Mental", level: 10 },
  {
    slug: "energy-bulwark",
    name: "Baluarte de Energia",
    level: 15,
  },
  {
    slug: "telekinetic-master",
    name: "Mestre Telecinético",
    level: 18,
  },
];

const PRECAUTION_SPELLS = [
  ["alarme", "Alarme"],
  ["compreender-idiomas", "Compreender Idiomas"],
  ["detectar-magia", "Detectar Magia"],
  ["detectar-veneno-e-doenca", "Detectar Veneno e Doença"],
  ["encontrar-armadilhas", "Encontrar Armadilhas"],
  ["identificar", "Identificar"],
  ["purificar-alimentos-e-bebidas", "Purificar Alimentos e Bebidas"],
] as const;

export function FighterSubclassActions({
  characterId,
  subclassSlug,
  level,
  maneuvers = [],
  onResult,
}: FighterSubclassActionsProps) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();
  const [useRelentless, setUseRelentless] = useState(false);
  const [repeatWithPsi, setRepeatWithPsi] = useState(false);
  const [precautionSpell, setPrecautionSpell] = useState<string>(
    PRECAUTION_SPELLS[0][0],
  );

  function commitResult(result: FighterTableActionResult | undefined) {
    if (!result) return;
    queryClient.setQueryData(sessionKeys.state(characterId), result.state);
    onResult(result);
  }

  const maneuverMutation = useMutation({
    mutationFn: async (maneuverSlug: string) => {
      try {
        return await executeBattleMasterManeuver(
          requireToken(),
          characterId,
          maneuverSlug,
          useRelentless,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: commitResult,
  });

  const psiMutation = useMutation({
    mutationFn: async (actionSlug: PsiWarriorActionSlug) => {
      try {
        return await executePsiWarriorAction(
          requireToken(),
          characterId,
          actionSlug,
          repeatWithPsi,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: commitResult,
  });

  const precautionMutation = useMutation({
    mutationFn: async () => {
      try {
        return await castDungeonPrecaution(
          requireToken(),
          characterId,
          precautionSpell,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: commitResult,
  });

  if (subclassSlug === "battle-master") {
    return (
      <div className="mt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Manobras
          </p>
          {level >= 15 ? (
            <label className="text-[0.65rem] text-muted-foreground">
              <input
                className="mr-1 align-middle"
                type="checkbox"
                checked={useRelentless}
                onChange={(event) => setUseRelentless(event.target.checked)}
              />
              Implacável (d8, sem gasto)
            </label>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {maneuvers.map((maneuver) => (
            <Button
              key={maneuver.slug}
              type="button"
              size="xs"
              variant="outline"
              disabled={maneuverMutation.isPending}
              title={maneuver.description}
              onClick={() => maneuverMutation.mutate(maneuver.slug)}
            >
              {maneuver.name}
            </Button>
          ))}
        </div>
        <MutationError error={maneuverMutation.error} />
      </div>
    );
  }

  if (subclassSlug === "psi-warrior") {
    const available = PSI_ACTIONS.filter((action) => level >= action.level);
    return (
      <div className="mt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Poderes psiônicos
          </p>
          <label className="text-[0.65rem] text-muted-foreground">
            <input
              className="mr-1 align-middle"
              type="checkbox"
              checked={repeatWithPsi}
              onChange={(event) => setRepeatWithPsi(event.target.checked)}
            />
            repetir gastando dado psi
          </label>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {available.map((action) => (
            <Button
              key={action.slug}
              type="button"
              size="xs"
              variant="outline"
              disabled={psiMutation.isPending}
              onClick={() => psiMutation.mutate(action.slug)}
            >
              {action.name}
            </Button>
          ))}
        </div>
        <MutationError error={psiMutation.error} />
      </div>
    );
  }

  if (subclassSlug === "dungeoneer" && level >= 7) {
    return (
      <div className="mt-2">
        <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Precauções na Masmorra
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <select
            className="min-w-44 rounded border border-border/70 bg-background px-2 py-1 text-xs"
            value={precautionSpell}
            onChange={(event) => setPrecautionSpell(event.target.value)}
          >
            {PRECAUTION_SPELLS.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={precautionMutation.isPending}
            onClick={() => precautionMutation.mutate()}
          >
            Conjurar (1 uso)
          </Button>
        </div>
        <MutationError error={precautionMutation.error} />
      </div>
    );
  }

  return null;
}

function MutationError({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {error.message}
    </p>
  );
}
