"use client";

import { useMemo, useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import { executePaladinTableAction } from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatPaladinPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

export function CombatPaladinPanel({
  characterId,
  classSlug,
  level,
  combatNotes,
  state,
}: CombatPaladinPanelProps) {
  const [healAmount, setHealAmount] = useState(1);
  const action = useTableActionMutation(characterId, executePaladinTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog();
  const panelCatalog = mechanicalCatalog.data?.panelActions ?? [];

  const channelActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "paladin",
        level,
        section: "channel",
      }),
    [panelCatalog, level],
  );

  if (classSlug !== "paladin") return null;

  const layOnHands = state?.classResources?.find(
    (item) => item.slug === "layOnHands",
  );
  const channel = state?.classResources?.find(
    (item) => item.slug === "channelDivinity",
  );
  const poolRemaining = layOnHands?.remaining ?? 0;
  const channelRemaining = channel?.remaining ?? 0;

  const actionsContent = (
    <div className="space-y-2">
      {layOnHands ? (
        <div>
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
              title="Ação: gasta pontos da reserva para curar"
              onClick={() =>
                action.mutate({
                  actionSlug: "lay-on-hands",
                  amount: healAmount,
                })
              }
            >
              Curar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={action.isPending || poolRemaining < 5}
              title="Ação: gasta 5 pontos para curar veneno ou doença"
              onClick={() => action.mutate({ actionSlug: "cure-poison" })}
            >
              Curar Veneno (5)
            </Button>
          </div>
        </div>
      ) : null}

      {channel ? (
        <p className="text-sm text-muted-foreground">
          Canalizar Divindade:{" "}
          <span className="font-semibold text-foreground">
            {channelRemaining}/{channel.max}
          </span>
        </p>
      ) : null}

      <CombatPanelActionButtons
        actions={channelActions}
        isPending={action.isPending}
        disabled={channelRemaining <= 0}
        displayRemaining={channelRemaining}
        variant="outline"
        onAction={(slug) => action.mutate({ actionSlug: slug as never })}
      />

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  return (
    <CombatClassPanelShell
      title="Combate do Paladino"
      actionsContent={actionsContent}
      combatNotes={combatNotes}
    />
  );
}
