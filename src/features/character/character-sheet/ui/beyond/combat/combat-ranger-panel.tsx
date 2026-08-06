"use client";

import { useEffect, useState } from "react";

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

function clampAspect(n: number): number {
  return Math.min(5, Math.max(0, Math.trunc(n)));
}

export function CombatRangerPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatRangerPanelProps) {
  const action = useTableActionMutation(characterId, executeRangerTableAction);
  const isBeastborne = subclassSlug === "beastborne" && level >= 3;
  const aspectLevel = state?.bestialAspectLevel ?? 0;
  const [draftAspect, setDraftAspect] = useState(aspectLevel);

  useEffect(() => {
    setDraftAspect(aspectLevel);
  }, [aspectLevel]);

  if (classSlug !== "ranger") return null;

  const resources = state?.classResources ?? [];
  const available = RANGER_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  const baseActions = available.filter((item) => !item.subclass);
  const subclassActions = available.filter((item) => item.subclass);

  const beastborneContent = isBeastborne ? (
    <div className="space-y-2 rounded-md border border-border/60 p-2">
      <p className="text-sm text-muted-foreground">
        Aspecto Bestial:{" "}
        <span className="font-semibold text-foreground">{aspectLevel}/5</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={action.isPending || !state || draftAspect <= 0}
          onClick={() => setDraftAspect((value) => clampAspect(value - 1))}
        >
          −
        </Button>
        <span className="min-w-8 text-center text-sm font-medium">
          {draftAspect}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={action.isPending || !state || draftAspect >= 5}
          onClick={() => setDraftAspect((value) => clampAspect(value + 1))}
        >
          +
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={action.isPending || !state || draftAspect === aspectLevel}
          title="Definir nível de Aspecto Bestial na mesa"
          onClick={() =>
            action.mutate({
              actionSlug: "set-bestial-aspect",
              level: draftAspect,
            })
          }
        >
          Aplicar
        </Button>
        {level >= 7 ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={action.isPending || !state}
            title="Na iniciativa: role 1d4 e defina o Aspecto Bestial"
            onClick={() => action.mutate({ actionSlug: "feral-howl" })}
          >
            Uivo Feral
          </Button>
        ) : null}
      </div>
    </div>
  ) : null;

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
              onClick={() => action.mutate({ actionSlug: item.slug })}
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
    subclassActions.length > 0 || beastborneContent ? (
      <div className="space-y-2">
        {beastborneContent}
        {subclassActions.length > 0 ? (
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
                  onClick={() => action.mutate({ actionSlug: item.slug })}
                >
                  {item.label}
                  {remaining != null ? ` (${remaining})` : ""}
                </Button>
              );
            })}
          </div>
        ) : null}

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
