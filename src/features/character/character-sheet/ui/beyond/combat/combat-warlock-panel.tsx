"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeWarlockTableAction,
  type WarlockTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
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

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2 space-y-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Bruxo (Magia de Pacto)
      </p>

      <div className="mt-1 space-y-1 text-sm text-muted-foreground">
        {resources.map((res) => {
          if (
            res.slug !== "healing-light" &&
            res.slug !== "dark-ones-own-luck"
          )
            return null;
          return (
            <p key={res.slug}>
              {res.name}:{" "}
              <span className="font-semibold text-foreground">
                {res.remaining}/{res.max}
              </span>
            </p>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {availableActions.map((item) => {
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
