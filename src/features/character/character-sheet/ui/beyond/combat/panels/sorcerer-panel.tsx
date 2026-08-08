"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeSorcererTableAction,
  type SorcererTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { CombatResourceSummary } from "../shared/resource-summary";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatSorcererPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

function isSorceryPointsSlug(slug: string): boolean {
  return slug === "sorceryPoints" || slug === "sorcery-points";
}

export function CombatSorcererPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatSorcererPanelProps) {
  const action = useTableActionMutation(
    characterId,
    executeSorcererTableAction,
  );
  const mechanicalCatalog = useCombatMechanicalCatalog({ classSlug, subclassSlug });
  const panelCatalog = mechanicalCatalog.data?.panelActions ?? [];

  const metamagicActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "sorcerer",
        level,
        subclassSlug,
        section: "metamagic",
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "sorcerer",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  if (classSlug !== "sorcerer") return null;

  const resources = state?.classResources ?? [];
  const pointsResource = resources.find((item) =>
    isSorceryPointsSlug(item.slug),
  );
  const pointsRemaining = pointsResource?.remaining ?? 0;

  function getRemaining(slug: string): number | null {
    if (isSorceryPointsSlug(slug)) return pointsRemaining;
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const slotsRemaining = state?.spellSlotsRemaining ?? {};
  const slotsMax = state?.spellSlotsMax ?? {};

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={["sorceryPoints", "sorcery-points"]}
      />

      {level >= 2 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Converter Slot de Magia → Pontos (+1 Ponto / nível do Slot):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((slotLvl) => {
              const remaining = slotsRemaining[String(slotLvl)] ?? 0;
              const slug =
                `convert-slot-${slotLvl}-to-points` as SorcererTableActionSlug;
              return (
                <Button
                  key={slug}
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={action.isPending || remaining <= 0}
                  onClick={() => action.mutate(slug)}
                >
                  Slot {slotLvl}º ({remaining} disp.)
                </Button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-muted-foreground pt-1">
            Criar Slot de Magia ← Pontos (Custos: L1=2, L2=3, L3=5, L4=6, L5=7
            pts):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { lvl: 1, cost: 2 },
              { lvl: 2, cost: 3 },
              { lvl: 3, cost: 5 },
              { lvl: 4, cost: 6 },
              { lvl: 5, cost: 7 },
            ].map(({ lvl, cost }) => {
              const max = slotsMax[String(lvl)] ?? 0;
              if (max <= 0) return null;
              const slug =
                `convert-points-to-slot-${lvl}` as SorcererTableActionSlug;
              return (
                <Button
                  key={slug}
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={action.isPending || pointsRemaining < cost}
                  onClick={() => action.mutate(slug)}
                >
                  +Slot {lvl}º ({cost} pts)
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {metamagicActions.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Metamágica:
          </p>
          <CombatPanelActionButtons
            actions={metamagicActions}
            getRemaining={getRemaining}
            isPending={action.isPending}
            size="xs"
            variant="secondary"
            showRemaining={false}
            onAction={(slug) => action.mutate(slug as SorcererTableActionSlug)}
          />
        </div>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const powersContent =
    subclassActions.length > 0 ? (
      <div className="space-y-2">
        <CombatPanelActionButtons
          actions={subclassActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          showRemaining={false}
          onAction={(slug) => action.mutate(slug as SorcererTableActionSlug)}
        />

        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Combate do Feiticeiro (Fonte de Magia)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
