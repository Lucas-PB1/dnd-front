"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeDruidTableAction,
  type DruidTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatDruidPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type DruidAction = {
  slug: DruidTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  resourceSlug?: string;
};

const BASE_ACTIONS: readonly DruidAction[] = [
  {
    slug: "wild-shape",
    label: "Forma Selvagem (1 uso)",
    minLevel: 2,
    resourceSlug: "wildShape",
  },
  {
    slug: "wild-resurgence-slot",
    label: "Ressurgimento (Forma → Slot 1º)",
    minLevel: 5,
    resourceSlug: "wildShape",
  },
  {
    slug: "wild-resurgence-shape",
    label: "Ressurgimento (Slot 1º → Forma)",
    minLevel: 5,
  },
];

const SUBCLASS_ACTIONS: readonly DruidAction[] = [
  {
    slug: "moon-combat-wild-shape",
    label: "Forma Selvagem de Combate",
    minLevel: 3,
    subclass: "moon",
    resourceSlug: "wildShape",
  },
  {
    slug: "starry-form-archer",
    label: "Forma Estelar: Arquiro (1d8 Radiante)",
    minLevel: 3,
    subclass: "stars",
    resourceSlug: "wildShape",
  },
  {
    slug: "starry-form-chalice",
    label: "Forma Estelar: Cálice (+Cura)",
    minLevel: 3,
    subclass: "stars",
    resourceSlug: "wildShape",
  },
  {
    slug: "starry-form-dragon",
    label: "Forma Estelar: Dragão (Mín 10)",
    minLevel: 3,
    subclass: "stars",
    resourceSlug: "wildShape",
  },
  {
    slug: "wrath-of-the-sea",
    label: "Ira do Mar (Aura de Tempestade)",
    minLevel: 3,
    subclass: "sea",
    resourceSlug: "wildShape",
  },
];

export function CombatDruidPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatDruidPanelProps) {
  const action = useTableActionMutation(characterId, executeDruidTableAction);

  if (classSlug !== "druid") return null;

  const resources = state?.classResources ?? [];
  const wildShapeResource = resources.find(
    (item) => item.slug === "wildShape" || item.slug === "wild-shape",
  );

  const availableBaseActions = BASE_ACTIONS.filter(
    (item) => level >= item.minLevel,
  );
  const availableSubclassActions = SUBCLASS_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2 space-y-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Druida (Forma Selvagem)
      </p>

      {wildShapeResource ? (
        <div className="text-sm text-muted-foreground">
          Usos de Forma Selvagem:{" "}
          <span className="font-semibold text-foreground">
            {wildShapeResource.remaining}/{wildShapeResource.max}
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        {availableBaseActions.map((item) => (
          <Button
            key={item.slug}
            type="button"
            size="sm"
            variant={item.resourceSlug ? "outline" : "secondary"}
            disabled={
              action.isPending ||
              (item.resourceSlug != null &&
                wildShapeResource != null &&
                wildShapeResource.remaining <= 0)
            }
            onClick={() => action.mutate(item.slug)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {availableSubclassActions.length ? (
        <div className="pt-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Habilidades de Círculo:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSubclassActions.map((item) => (
              <Button
                key={item.slug}
                type="button"
                size="sm"
                variant="default"
                disabled={
                  action.isPending ||
                  (item.resourceSlug != null &&
                    wildShapeResource != null &&
                    wildShapeResource.remaining <= 0)
                }
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
