"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeWizardTableAction,
  type WizardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
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

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2 space-y-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Mago (Grimório & Tradição Arcana)
      </p>

      <div className="space-y-1 pt-1">
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

      {availableSubclassActions.length ? (
        <div className="pt-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Tradição Arcana & Habilidades de Escola:
          </p>
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
        </div>
      ) : null}

      {combatNotes?.length ? (
        <ul className="mt-2 space-y-1 text-[0.7rem] text-muted-foreground">
          {combatNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );
}
