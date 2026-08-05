"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeMonkTableAction,
  type MonkTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { CombatClassPanelShell } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-panel-shell";
import { CombatResourceSummary } from "@/features/character/character-sheet/ui/beyond/combat/combat-resource-summary";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatMonkPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type MonkAction = {
  slug: MonkTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  spendsFocus: boolean;
};

const MONK_ACTIONS: readonly MonkAction[] = [
  {
    slug: "flurry-of-blows",
    label: "Torrente de Golpes",
    minLevel: 2,
    spendsFocus: true,
  },
  {
    slug: "patient-defense",
    label: "Defesa Paciente",
    minLevel: 2,
    spendsFocus: true,
  },
  {
    slug: "step-of-the-wind",
    label: "Passo do Vento",
    minLevel: 2,
    spendsFocus: true,
  },
  {
    slug: "stunning-strike",
    label: "Golpe Atordoante",
    minLevel: 5,
    spendsFocus: true,
  },
  {
    slug: "open-hand-technique",
    label: "Técnica da Mão Espalmada",
    minLevel: 3,
    subclass: "open-hand",
    spendsFocus: false,
  },
  {
    slug: "elemental-blast",
    label: "Explosão Elemental",
    minLevel: 3,
    subclass: "elements",
    spendsFocus: true,
  },
  {
    slug: "hand-of-healing",
    label: "Mão de Cura",
    minLevel: 3,
    subclass: "mercy",
    spendsFocus: true,
  },
  {
    slug: "hand-of-harm",
    label: "Mão de Dolo",
    minLevel: 3,
    subclass: "mercy",
    spendsFocus: true,
  },
  {
    slug: "shadow-step",
    label: "Passo da Sombra",
    minLevel: 6,
    subclass: "shadow",
    spendsFocus: false,
  },
];

export function CombatMonkPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatMonkPanelProps) {
  const action = useTableActionMutation(characterId, executeMonkTableAction);

  if (classSlug !== "monk") return null;

  const resources = state?.classResources ?? [];
  const focus = resources.find((item) => item.slug === "focusPoints");
  const focusRemaining = focus?.remaining ?? 0;

  const available = MONK_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  const baseActions = available.filter((item) => !item.subclass);
  const subclassActions = available.filter((item) => item.subclass);

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary resources={resources} slugs={["focusPoints"]} />

      <div className="flex flex-wrap gap-2">
        {baseActions.map((item) => (
          <Button
            key={item.slug}
            type="button"
            size="sm"
            variant={item.spendsFocus ? "outline" : "ghost"}
            title={item.spendsFocus ? `Gasta 1 Ponto de Foco (${focusRemaining})` : undefined}
            disabled={
              action.isPending || (item.spendsFocus && focusRemaining <= 0)
            }
            onClick={() => action.mutate(item.slug)}
          >
            {item.label}
            {item.spendsFocus ? ` (${focusRemaining})` : ""}
          </Button>
        ))}
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
          {subclassActions.map((item) => (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant={item.spendsFocus ? "outline" : "ghost"}
              title={item.spendsFocus ? `Gasta 1 Ponto de Foco (${focusRemaining})` : undefined}
              disabled={
                action.isPending || (item.spendsFocus && focusRemaining <= 0)
              }
              onClick={() => action.mutate(item.slug)}
            >
              {item.label}
              {item.spendsFocus ? ` (${focusRemaining})` : ""}
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
      title="Combate do Monge"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
