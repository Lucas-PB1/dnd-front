"use client";

import { useMemo, useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeRogueTableAction,
  type RogueTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { useSheetRolls } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import { Button } from "@/shared/ui/button";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

const SOULKNIFE_PAYLOAD_SLUGS = new Set<string>([
  "psi-bolstered-knack",
  "guided-strike",
]);

type CombatRoguePanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

export function CombatRoguePanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatRoguePanelProps) {
  const rolls = useSheetRolls();
  const [checkTotal, setCheckTotal] = useState("10");
  const [dc, setDc] = useState("15");
  const [usePsiDie, setUsePsiDie] = useState(false);

  const action = useTableActionMutation(
    characterId,
    (token: string, id: string, actionSlug: RogueTableActionSlug) => {
      const needsPayload = SOULKNIFE_PAYLOAD_SLUGS.has(actionSlug);
      return executeRogueTableAction(token, id, {
        actionSlug,
        checkTotal: needsPayload ? Number(checkTotal) || undefined : undefined,
        dc: needsPayload ? Number(dc) || undefined : undefined,
        usePsiDie,
      });
    },
  );

  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;

  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "rogue",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  if (classSlug !== "rogue") return null;

  const resources = state?.classResources ?? [];
  const psiRemaining =
    resources.find((entry) => entry.slug === "soulknife-psi-dice")?.remaining ??
    0;
  const hasFreeSoulknifeUse =
    (resources.find((entry) => entry.slug === "psychic-whispers")?.remaining ??
      0) > 0 ||
    (resources.find((entry) => entry.slug === "psychic-veil")?.remaining ?? 0) >
      0 ||
    (resources.find((entry) => entry.slug === "rend-mind")?.remaining ?? 0) > 0;
  const isSoulknife = subclassSlug === "soulknife";
  const sneakDie = Math.ceil(level / 2);
  const sneakLabel =
    subclassSlug === "arachnoid-stalker"
      ? `${sneakDie}d6 (ou d8 Venenoso)`
      : `${sneakDie}d6`;

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  function run(slug: string) {
    action.mutate(slug as RogueTableActionSlug);
  }

  const actionsContent = (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Ataque Furtivo:{" "}
        <span className="font-semibold text-foreground">{sneakLabel}</span>
      </p>

      {level >= 20 ? (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={
            rolls.initiative.isPending ||
            (getRemaining("strokeOfLuck") ?? 0) <= 0
          }
          title="Golpe de Sorte: transforma falha crítica em sucesso (nv. 20)"
          onClick={() => rolls.initiative.mutate({ strokeOfLuck: true })}
        >
          Golpe de Sorte na iniciativa ({getRemaining("strokeOfLuck") ?? 0})
        </Button>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const soulknifeExtras = isSoulknife ? (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-[0.7rem] text-muted-foreground">
        Total atual
        <input
          className="ml-1 w-14 rounded border border-border/70 bg-background px-1 py-0.5 font-mono text-sm"
          value={checkTotal}
          inputMode="numeric"
          onChange={(event) => setCheckTotal(event.target.value)}
        />
      </label>
      <label className="text-[0.7rem] text-muted-foreground">
        CD/CA
        <input
          className="ml-1 w-14 rounded border border-border/70 bg-background px-1 py-0.5 font-mono text-sm"
          value={dc}
          inputMode="numeric"
          onChange={(event) => setDc(event.target.value)}
        />
      </label>
      {hasFreeSoulknifeUse || usePsiDie ? (
        <label className="text-[0.7rem] text-muted-foreground">
          <input
            className="mr-1 align-middle"
            type="checkbox"
            checked={usePsiDie}
            onChange={(event) => setUsePsiDie(event.target.checked)}
          />
          gastar dado psi (em vez do uso gratuito) · {psiRemaining}
        </label>
      ) : (
        <span className="text-[0.7rem] text-muted-foreground">
          Dados psi: {psiRemaining}
        </span>
      )}
    </div>
  ) : null;

  const powersContent =
    subclassActions.length > 0 || soulknifeExtras ? (
      <div className="space-y-2">
        {soulknifeExtras}
        <CombatPanelActionButtons
          actions={subclassActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          variant="secondary"
          onAction={run}
        />
        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Combate do Ladino"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
