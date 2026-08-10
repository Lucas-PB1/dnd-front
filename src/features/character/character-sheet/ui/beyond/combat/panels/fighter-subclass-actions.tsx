"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  type BattleMasterManeuver,
  type FighterTableActionResult,
  executeFighterTableAction,
  sessionKeys,
} from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import {
  CombatPanelActionList,
  CombatPanelActionRow,
} from "../shared/panel-action-row";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type FighterSubclassActionsProps = {
  characterId: string;
  subclassSlug?: string | null;
  level: number;
  maneuvers?: BattleMasterManeuver[];
  onResult: (result: FighterTableActionResult) => void;
};

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
  const mechanicalCatalog = useCombatMechanicalCatalog({ classSlug: "fighter", subclassSlug });
  const precautionSpells = mechanicalCatalog.data?.precautionSpells ?? [];
  const [useRelentless, setUseRelentless] = useState(false);
  const [precautionSpell, setPrecautionSpell] = useState<string>("");

  useEffect(() => {
    if (!precautionSpell && precautionSpells.length > 0) {
      setPrecautionSpell(precautionSpells[0].slug);
    }
  }, [precautionSpell, precautionSpells]);

  function commitResult(result: FighterTableActionResult | undefined) {
    if (!result) return;
    queryClient.setQueryData(sessionKeys.state(characterId), result.state);
    onResult(result);
  }

  const maneuverMutation = useMutation({
    mutationFn: async (maneuverSlug: string) => {
      try {
        return await executeFighterTableAction(requireToken(), characterId, {
          actionSlug: "use-maneuver",
          maneuverSlug,
          useRelentless,
        });
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: commitResult,
  });

  const precautionMutation = useMutation({
    mutationFn: async () => {
      try {
        return await executeFighterTableAction(requireToken(), characterId, {
          actionSlug: "dungeon-precaution",
          spellSlug: precautionSpell,
        });
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: commitResult,
  });

  if (subclassSlug === "battle-master") {
    return (
      <div className="mt-1 space-y-1">
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
        <CombatPanelActionList title="Manobras" count={maneuvers.length}>
          {maneuvers.map((maneuver) => (
            <CombatPanelActionRow
              key={maneuver.slug}
              name={maneuver.name}
              description={maneuver.description}
              disabled={maneuverMutation.isPending}
              pending={maneuverMutation.isPending}
              onAction={() => maneuverMutation.mutate(maneuver.slug)}
            />
          ))}
        </CombatPanelActionList>
        <MutationError error={maneuverMutation.error} />
      </div>
    );
  }

  if (subclassSlug === "dungeoneer" && level >= 7) {
    return (
      <div className="mt-1">
        <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Precauções na Masmorra
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <SearchableSelect
            className="min-w-44 text-xs"
            value={precautionSpell}
            options={precautionSpells.map((spell) => ({
              value: spell.slug,
              label: spell.name,
            }))}
            onValueChange={setPrecautionSpell}
          />
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={
              precautionMutation.isPending ||
              !precautionSpell ||
              precautionSpells.length === 0
            }
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
