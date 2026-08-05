"use client";

import type { CharacterState } from "@/entities/character/session-types";
import {
  executeSorcererTableAction,
  type SorcererTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { TableActionFeedback } from "@/features/character/character-sheet/ui/beyond/combat/table-action-feedback";
import { Button } from "@/shared/ui/button";

type CombatSorcererPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

type SorcererAction = {
  slug: SorcererTableActionSlug;
  label: string;
  minLevel: number;
  subclass?: string;
  resourceSlug?: string;
};

const METAMAGIC_ACTIONS: readonly SorcererAction[] = [
  {
    slug: "use-metamagic-1",
    label: "Metamágica (1 pt)",
    minLevel: 2,
    resourceSlug: "sorceryPoints",
  },
  {
    slug: "use-metamagic-2",
    label: "Metamágica (2 pts)",
    minLevel: 2,
    resourceSlug: "sorceryPoints",
  },
  {
    slug: "use-metamagic-3",
    label: "Metamágica (3 pts)",
    minLevel: 2,
    resourceSlug: "sorceryPoints",
  },
];

const SUBCLASS_ACTIONS: readonly SorcererAction[] = [
  {
    slug: "innate-sorcery",
    label: "Ira Feiticeira",
    minLevel: 1,
  },
  {
    slug: "sorcerous-restoration",
    label: "Restauração Feiticeira",
    minLevel: 5,
  },
  {
    slug: "tides-of-chaos",
    label: "Maré de Caos",
    minLevel: 3,
    subclass: "wild-magic",
  },
  {
    slug: "bastion-of-law",
    label: "Baluarte da Ordem",
    minLevel: 6,
    subclass: "clockwork",
    resourceSlug: "sorceryPoints",
  },
];

export function CombatSorcererPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatSorcererPanelProps) {
  const action = useTableActionMutation(
    characterId,
    executeSorcererTableAction,
  );

  if (classSlug !== "sorcerer") return null;

  const resources = state?.classResources ?? [];
  const pointsResource = resources.find(
    (item) => item.slug === "sorceryPoints" || item.slug === "sorcery-points",
  );

  const availableSubclassActions = SUBCLASS_ACTIONS.filter(
    (item) =>
      level >= item.minLevel &&
      (!item.subclass || item.subclass === subclassSlug),
  );

  const slotsRemaining = state?.spellSlotsRemaining ?? {};
  const slotsMax = state?.spellSlotsMax ?? {};

  return (
    <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2 space-y-2">
      <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        Combate do Feiticeiro (Fonte de Magia)
      </p>

      {pointsResource ? (
        <div className="text-sm text-muted-foreground">
          Pontos de Feitiçaria:{" "}
          <span className="font-semibold text-foreground">
            {pointsResource.remaining}/{pointsResource.max}
          </span>
        </div>
      ) : null}

      {level >= 2 ? (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-medium text-muted-foreground">
            Converter Slot de Magia → Pontos (+1 Ponto / nível do Slot):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((slotLvl) => {
              const remaining = slotsRemaining[String(slotLvl)] ?? 0;
              const slug =
                `convert-slot-${slotLvl}-to-points` as SorcererTableActionSlug;
              return (
                <Button
                  key={slug}
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={action.isPending || remaining <= 0}
                  onClick={() => action.mutate(slug)}
                >
                  Slot {slotLvl}º ({remaining} disp.)
                </Button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-muted-foreground pt-1">
            Criar Slot de Magia ← Pontos (Custos: L1=2, L2=3, L3=5, L4=6, L5=7 pts):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { lvl: 1, cost: 2 },
              { lvl: 2, cost: 3 },
              { lvl: 3, cost: 5 },
              { lvl: 4, cost: 6 },
              { lvl: 5, cost: 7 },
            ].map(({ lvl, cost }) => {
              const max = slotsMax[String(lvl)] ?? 0;
              if (max <= 0) return null;
              const pointsLeft = pointsResource?.remaining ?? 0;
              const slug =
                `convert-points-to-slot-${lvl}` as SorcererTableActionSlug;
              return (
                <Button
                  key={slug}
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={action.isPending || pointsLeft < cost}
                  onClick={() => action.mutate(slug)}
                >
                  +Slot {lvl}º ({cost} pts)
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {level >= 2 ? (
        <div className="pt-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Metamágica:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {METAMAGIC_ACTIONS.map((item) => (
              <Button
                key={item.slug}
                type="button"
                size="xs"
                variant="secondary"
                disabled={
                  action.isPending ||
                  (pointsResource != null && pointsResource.remaining <= 0)
                }
                onClick={() => action.mutate(item.slug)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {availableSubclassActions.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {availableSubclassActions.map((item) => (
            <Button
              key={item.slug}
              type="button"
              size="sm"
              variant={item.resourceSlug ? "outline" : "ghost"}
              disabled={
                action.isPending ||
                (item.resourceSlug != null &&
                  pointsResource != null &&
                  pointsResource.remaining <= 0)
              }
              onClick={() => action.mutate(item.slug)}
            >
              {item.label}
            </Button>
          ))}
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
