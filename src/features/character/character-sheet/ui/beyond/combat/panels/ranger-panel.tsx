"use client";

import { useEffect, useMemo, useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeRangerTableAction,
  type RangerTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { Button } from "@/shared/ui/button";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];
const FERAL_HOWL_SLUG = "feral-howl";

type CombatRangerPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

function clampAspect(n: number): number {
  return Math.min(5, Math.max(0, Math.trunc(n)));
}

export function CombatRangerPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatRangerPanelProps) {
  const action = useTableActionMutation(characterId, executeRangerTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;

  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "ranger",
        level,
        subclassSlug,
        section: "subclass",
      }).filter((entry) => entry.slug !== FERAL_HOWL_SLUG),
    [panelCatalog, level, subclassSlug],
  );

  const isBeastborne = subclassSlug === "beastborne" && level >= 3;
  const aspectLevel = state?.bestialAspectLevel ?? 0;
  const [draftAspect, setDraftAspect] = useState(aspectLevel);

  useEffect(() => {
    setDraftAspect(aspectLevel);
  }, [aspectLevel]);

  if (classSlug !== "ranger") return null;

  const resources = state?.classResources ?? [];

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  function run(slug: string) {
    action.mutate({ actionSlug: slug as RangerTableActionSlug });
  }

  const beastborneContent = isBeastborne ? (
    <div className="space-y-2 rounded-md border border-border/60 p-2">
      <p className="text-sm text-muted-foreground">
        Aspecto Bestial:{" "}
        <span className="font-semibold text-foreground">{aspectLevel}/5</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={action.isPending || !state || draftAspect <= 0}
          onClick={() => setDraftAspect((value) => clampAspect(value - 1))}
        >
          −
        </Button>
        <span className="min-w-8 text-center text-sm font-medium">
          {draftAspect}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={action.isPending || !state || draftAspect >= 5}
          onClick={() => setDraftAspect((value) => clampAspect(value + 1))}
        >
          +
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={action.isPending || !state || draftAspect === aspectLevel}
          title="Definir nível de Aspecto Bestial na mesa"
          onClick={() =>
            action.mutate({
              actionSlug: "set-bestial-aspect",
              level: draftAspect,
            })
          }
        >
          Aplicar
        </Button>
        {level >= 7 ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={action.isPending || !state}
            title="Na iniciativa: role 1d4 e defina o Aspecto Bestial"
            onClick={() => run(FERAL_HOWL_SLUG)}
          >
            Uivo Feral
          </Button>
        ) : null}
      </div>
    </div>
  ) : null;

  const powersContent =
    subclassActions.length > 0 || beastborneContent ? (
      <div className="space-y-2">
        {beastborneContent}
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
      title="Combate do Patrulheiro"
      actionsContent={null}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
