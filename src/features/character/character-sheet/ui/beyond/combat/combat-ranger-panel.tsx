"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeRangerTableAction,
  type RangerTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
import { CombatResourceSummary } from "@/features/character/character-sheet/ui/beyond/combat/combat-resource-summary";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatRangerPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type RangerAction = {
  slug: RangerTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  resourceSlug?: string;
};

const RANGER_ACTIONS: readonly RangerAction[] = [
  {
    slug: "hunters-mark-free",
    label: "Marca do Predador (gratuita)",
    minLevel: 1,
    resourceSlug: "favoredEnemy",
  },
  {
    slug: "tireless",
    label: "Incansável",
    minLevel: 10,
    resourceSlug: "tireless",
  },
  {
    slug: "natures-veil",
    label: "Véu da Natureza",
    minLevel: 14,
    resourceSlug: "naturesVeil",
  },
  {
    slug: "fey-reinforcements",
    label: "Reforços Feéricos",
    minLevel: 11,
    subclass: "fey-wanderer",
    resourceSlug: "fey-reinforcements",
  },
  {
    slug: "misty-wanderer",
    label: "Andarilho Nebuloso",
    minLevel: 15,
    subclass: "fey-wanderer",
    resourceSlug: "misty-wanderer",
  },
  {
    slug: "primal-companion",
    label: "Companheiro Primal",
    minLevel: 3,
    subclass: "beast-master",
  },
];

export function CombatRangerPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatRangerPanelProps) {
  const action = useTableActionMutation(characterId, executeRangerTableAction);

  if (classSlug !== "ranger") return null;

  const resources = state?.classResources ?? [];
  const available = RANGER_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  const baseActions = available.filter((item) => !item.subclass);
  const subclassActions = available.filter((item) => item.subclass);

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={["favoredEnemy", "tireless", "naturesVeil", "dread-strike"]}
      />

      <div className="flex flex-wrap gap-2">
        {baseActions.map((item) => {
          const resource = item.resourceSlug
            ? resources.find((entry) => entry.slug === item.resourceSlug)
            : undefined;
          const remaining = resource?.remaining ?? null;
          return (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant={item.resourceSlug ? "outline" : "ghost"}
              disabled={
                action.isPending || (remaining != null && remaining <= 0)
              }
              onClick={() => action.mutate(item.slug)}
            >
              {item.label}
              {remaining != null ? ` (${remaining})` : ""}
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
            const remaining = resource?.remaining ?? null;
            return (
              <Button
                key={item.slug}
                type="button"
                size="sm"
                variant={item.resourceSlug ? "outline" : "ghost"}
                disabled={
                  action.isPending || (remaining != null && remaining <= 0)
                }
                onClick={() => action.mutate(item.slug)}
              >
                {item.label}
                {remaining != null ? ` (${remaining})` : ""}
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
      title="Combate do Guardião"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
