"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeWizardTableAction,
  type WizardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatWizardPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

export function CombatWizardPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatWizardPanelProps) {
  const action = useTableActionMutation(characterId, executeWizardTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({ classSlug, subclassSlug });
  const panelCatalog = mechanicalCatalog.data?.panelActions ?? [];

  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "wizard",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  if (classSlug !== "wizard") return null;

  const resources = state?.classResources ?? [];

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const maxSlotLevelsToRecover = Math.ceil(level / 2);
  const slotsMax = state?.spellSlotsMax ?? {};

  const actionsContent = (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Recuperação Arcana (1×/Descanso Curto — limite total:{" "}
          {maxSlotLevelsToRecover} níveis de slot):
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map((slotLvl) => {
            const max = slotsMax[String(slotLvl)] ?? 0;
            if (max <= 0 || slotLvl > maxSlotLevelsToRecover) return null;
            const slug =
              `arcane-recovery-${slotLvl}` as WizardTableActionSlug;
            return (
              <Button
                key={slug}
                type="button"
                size="xs"
                variant="outline"
                disabled={action.isPending}
                onClick={() => action.mutate(slug)}
              >
                Recuperar Slot {slotLvl}º
              </Button>
            );
          })}
        </div>
      </div>

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
          variant="secondary"
          onAction={(slug) => action.mutate(slug as WizardTableActionSlug)}
        />

        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Combate do Mago (Grimório & Tradição Arcana)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
