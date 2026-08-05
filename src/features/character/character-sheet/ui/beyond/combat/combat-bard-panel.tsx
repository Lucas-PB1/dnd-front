"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeBardTableAction,
  type BardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatBardPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type BardAction = {
  slug: BardTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  resourceSlug?: string;
};

const BARD_ACTIONS: readonly BardAction[] = [
  {
    slug: "grant-inspiration",
    label: "Conceder Inspiração",
    minLevel: 1,
    resourceSlug: "bardicInspiration",
  },
  {
    slug: "cutting-words",
    label: "Palavras Cortantes",
    minLevel: 3,
    subclass: "lore",
    resourceSlug: "bardicInspiration",
  },
  {
    slug: "enthralling-performance",
    label: "Desempenho Cativante",
    minLevel: 3,
    subclass: "glamour",
    resourceSlug: "bardicInspiration",
  },
  {
    slug: "unarmed-dance",
    label: "Ataque Desarmado (Dança)",
    minLevel: 3,
    subclass: "dance",
  },
  {
    slug: "agile-response",
    label: "Resposta Ágil",
    minLevel: 6,
    subclass: "dance",
    resourceSlug: "bardicInspiration",
  },
  {
    slug: "combat-inspiration",
    label: "Inspiração de Combate",
    minLevel: 3,
    subclass: "valor",
    resourceSlug: "bardicInspiration",
  },
  {
    slug: "superior-inspiration",
    label: "Inspiração Superior (+1)",
    minLevel: 18,
  },
];

const BARD_RESOURCE_SLUGS = ["bardicInspiration", "bardic-inspiration"] as const;

export function CombatBardPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatBardPanelProps) {
  const action = useTableActionMutation(characterId, executeBardTableAction);

  if (classSlug !== "bard") return null;

  const resources = state?.classResources ?? [];
  const bardicResource = resources.find(
    (item) => item.slug === "bardicInspiration" || item.slug === "bardic-inspiration",
  );

  const availableActions = BARD_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Bardo
      </p>

      <div className="mt-1 space-y-1 text-sm text-muted-foreground">
        {bardicResource ? (
          <p>
            Inspiração Bárdica:{" "}
            <span className="font-semibold text-foreground">
              {bardicResource.remaining}/{bardicResource.max}
            </span>{" "}
            {bardicResource.dieLabel ? (
              <span className="text-xs text-muted-foreground font-mono">
                ({bardicResource.dieLabel})
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {availableActions.map((item) => {
          const resource = item.resourceSlug ? bardicResource : undefined;
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
