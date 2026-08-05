"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeDruidTableAction,
  type DruidTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
import { CombatResourceSummary } from "@/features/character/character-sheet/ui/beyond/combat/combat-resource-summary";
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

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={["wildShape", "wild-shape"]}
      />

      <div className="flex flex-wrap gap-2">
        {availableBaseActions.map((item) => {
          const remaining = wildShapeResource?.remaining ?? 0;
          return (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant={item.resourceSlug ? "outline" : "secondary"}
              title={item.resourceSlug ? `Gasta 1 uso de Forma Selvagem (${remaining})` : undefined}
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
    availableSubclassActions.length > 0 ? (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {availableSubclassActions.map((item) => {
            const remaining = wildShapeResource?.remaining ?? 0;
            return (
              <Button
                key={item.slug}
                type="button"
                size="sm"
                variant="default"
                title={item.resourceSlug ? `Gasta 1 uso de Forma Selvagem (${remaining})` : undefined}
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
      title="Combate do Druida (Forma Selvagem)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
