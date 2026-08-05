"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeWizardTableAction,
  type WizardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatWizardPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type WizardAction = {
  slug: WizardTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
};

const SUBCLASS_ACTIONS: readonly WizardAction[] = [
  {
    slug: "arcane-ward",
    label: "Proteção Arcana",
    minLevel: 3,
    subclass: "abjurer",
  },
  {
    slug: "portent",
    label: "Rolar Presságio",
    minLevel: 3,
    subclass: "diviner",
  },
  {
    slug: "sculpt-spells",
    label: "Esculpir Magias",
    minLevel: 3,
    subclass: "evoker",
  },
  {
    slug: "improved-illusions",
    label: "Ilusão Aprimorada",
    minLevel: 3,
    subclass: "illusionist",
  },
  {
    slug: "spell-mastery",
    label: "Dominância de Magias",
    minLevel: 18,
  },
];

export function CombatWizardPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatWizardPanelProps) {
  const action = useTableActionMutation(characterId, executeWizardTableAction);

  if (classSlug !== "wizard") return null;

  const maxSlotLevelsToRecover = Math.ceil(level / 2);
  const slotsMax = state?.spellSlotsMax ?? {};

  const availableSubclassActions = SUBCLASS_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  const actionsContent = (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Recuperação Arcana (1×/Descanso Curto — limite total: {maxSlotLevelsToRecover} níveis de slot):
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
    availableSubclassActions.length > 0 ? (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {availableSubclassActions.map((item) => (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant="secondary"
              disabled={action.isPending}
              onClick={() => action.mutate(item.slug)}
            >
              {item.label}
            </Button>
          ))}
        </div>

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
