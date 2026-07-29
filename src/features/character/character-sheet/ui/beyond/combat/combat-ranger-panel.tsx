"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeRangerTableAction,
  type RangerTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
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

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Guardião
      </p>

      <div className="mt-1 space-y-1 text-sm text-muted-foreground">
        {["favoredEnemy", "tireless", "naturesVeil", "dread-strike"].map(
          (slug) => {
            const resource = resources.find((item) => item.slug === slug);
            if (!resource) return null;
            return (
              <p key={slug}>
                {resource.name}:{" "}
                <span className="font-semibold text-foreground">
                  {resource.remaining}/{resource.max}
                </span>
              </p>
            );
          },
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {available.map((item) => {
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
            </Button>
          );
        })}
      </div>

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
