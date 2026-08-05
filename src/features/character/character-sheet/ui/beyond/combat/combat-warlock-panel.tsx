"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeWarlockTableAction,
  type WarlockTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
import { CombatResourceSummary } from "@/features/character/character-sheet/ui/beyond/combat/combat-resource-summary";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatWarlockPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type WarlockAction = {
  slug: WarlockTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  resourceSlug?: string;
};

const WARLOCK_ACTIONS: readonly WarlockAction[] = [
  {
    slug: "magical-cunning",
    label: "Contato Arcano (1 Slot)",
    minLevel: 5,
  },
  {
    slug: "healing-light",
    label: "Luz Curativa",
    minLevel: 3,
    subclass: "celestial",
    resourceSlug: "healing-light",
  },
  {
    slug: "dark-ones-own-luck",
    label: "Sorte do Próprio Inferno (+1d10)",
    minLevel: 3,
    subclass: "fiend",
    resourceSlug: "dark-ones-own-luck",
  },
  {
    slug: "fey-step-effect",
    label: "Passo de Bruma Aprimorado",
    minLevel: 3,
    subclass: "archfey",
  },
  {
    slug: "awakened-mind",
    label: "Mente Desperta / Hex Psíquico",
    minLevel: 3,
    subclass: "great-old-one",
  },
  {
    slug: "fiendish-resilience",
    label: "Resiliência Ínfera",
    minLevel: 10,
    subclass: "fiend",
  },
];

export function CombatWarlockPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatWarlockPanelProps) {
  const action = useTableActionMutation(characterId, executeWarlockTableAction);

  if (classSlug !== "warlock") return null;

  const resources = state?.classResources ?? [];
  const availableActions = WARLOCK_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  const baseActions = availableActions.filter((item) => !item.subclass);
  const subclassActions = availableActions.filter((item) => item.subclass);

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={["healing-light", "dark-ones-own-luck"]}
      />

      <div className="flex flex-wrap gap-2">
        {baseActions.map((item) => {
          const resource = item.resourceSlug
            ? resources.find((entry) => entry.slug === item.resourceSlug)
            : undefined;
          return (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant={item.resourceSlug ? "outline" : "ghost"}
              disabled={
                action.isPending ||
                (resource != null && resource.remaining <= 0)
              }
              onClick={() => action.mutate(item.slug)}
            >
              {item.label}
              {resource ? ` (${resource.remaining})` : ""}
            </Button>
          );
        })}
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
        <div className="flex flex-wrap gap-2">
          {subclassActions.map((item) => {
            const resource = item.resourceSlug
              ? resources.find((entry) => entry.slug === item.resourceSlug)
              : undefined;
            return (
              <Button
                key={item.slug}
                type="button"
                size="sm"
                variant={item.resourceSlug ? "outline" : "ghost"}
                disabled={
                  action.isPending ||
                  (resource != null && resource.remaining <= 0)
                }
                onClick={() => action.mutate(item.slug)}
              >
                {item.label}
                {resource ? ` (${resource.remaining})` : ""}
              </Button>
            );
          })}
        </div>

        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Combate do Bruxo (Magia de Pacto)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
