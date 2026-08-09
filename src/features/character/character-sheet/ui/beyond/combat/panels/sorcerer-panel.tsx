"use client";

import { useMemo } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassOption } from "@/entities/character/sheet-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeSorcererTableAction,
  type SorcererTableActionInput,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { readMetamagicSlugs } from "@/features/character/character-sheet/lib/sorcerer/metamagic";
import { useMetamagics } from "@/features/catalog/metamagic-catalog/api/use-metamagics";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { CombatResourceSummary } from "../shared/resource-summary";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { Button } from "@/shared/ui/button";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatSorcererPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
  classOptions?: ClassOption[] | null;
};

function isSorceryPointsSlug(slug: string): boolean {
  return slug === "sorceryPoints" || slug === "sorcery-points";
}

export function CombatSorcererPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
  classOptions,
}: CombatSorcererPanelProps) {
  const action = useTableActionMutation(
    characterId,
    executeSorcererTableAction,
  );
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;
  const metamagicsQuery = useMetamagics();

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "sorcerer",
        level,
        subclassSlug,
        section: "base",
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "sorcerer",
        level,
        subclassSlug,
        section: "subclass",
      }).filter((entry) => entry.slug !== "bastion-of-law"),
    [panelCatalog, level, subclassSlug],
  );

  const showBastion =
    subclassSlug === "clockwork" && level >= 6;

  const knownMetamagics = useMemo(() => {
    const slugs = readMetamagicSlugs(classOptions);
    if (slugs.length === 0) return [];
    const bySlug = new Map(
      (metamagicsQuery.data ?? []).map((row) => [row.slug, row]),
    );
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
  }, [classOptions, metamagicsQuery.data]);

  if (classSlug !== "sorcerer") return null;

  const resources = state?.classResources ?? [];
  const pointsResource = resources.find((item) =>
    isSorceryPointsSlug(item.slug),
  );
  const pointsRemaining = pointsResource?.remaining ?? 0;

  function getRemaining(slug: string): number | null {
    if (isSorceryPointsSlug(slug)) return pointsRemaining;
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  function run(input: SorcererTableActionInput) {
    action.mutate(input);
  }

  const slotsRemaining = state?.spellSlotsRemaining ?? {};
  const slotsMax = state?.spellSlotsMax ?? {};

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={[
          "sorceryPoints",
          "sorcery-points",
          "innate-sorcery",
          "sorcerous-restoration",
          "tides-of-chaos",
          "restore-balance",
          "dragon-wings",
          "warp-implosion",
        ]}
      />

      {baseActions.length > 0 ? (
        <CombatPanelActionButtons
          actions={baseActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          size="xs"
          onAction={(slug) => run({ actionSlug: slug as never })}
        />
      ) : null}

      {level >= 2 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Converter Slot de Magia → Pontos (+1 Ponto / nível do Slot):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { slotLvl: 1, slug: "convert-slot-1-to-points" },
                { slotLvl: 2, slug: "convert-slot-2-to-points" },
                { slotLvl: 3, slug: "convert-slot-3-to-points" },
                { slotLvl: 4, slug: "convert-slot-4-to-points" },
                { slotLvl: 5, slug: "convert-slot-5-to-points" },
              ] as const
            ).map(({ slotLvl, slug }) => {
              const remaining = slotsRemaining[String(slotLvl)] ?? 0;
              return (
                <Button
                  key={slug}
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={action.isPending || remaining <= 0}
                  onClick={() => run({ actionSlug: slug })}
                >
                  Slot {slotLvl}º ({remaining} disp.)
                </Button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-muted-foreground pt-1">
            Criar Slot de Magia ← Pontos (Custos: L1=2, L2=3, L3=5, L4=6, L5=7
            pts):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { lvl: 1, cost: 2, slug: "convert-points-to-slot-1" },
                { lvl: 2, cost: 3, slug: "convert-points-to-slot-2" },
                { lvl: 3, cost: 5, slug: "convert-points-to-slot-3" },
                { lvl: 4, cost: 6, slug: "convert-points-to-slot-4" },
                { lvl: 5, cost: 7, slug: "convert-points-to-slot-5" },
              ] as const
            ).map(({ lvl, cost, slug }) => {
              const max = slotsMax[String(lvl)] ?? 0;
              if (max <= 0) return null;
              return (
                <Button
                  key={slug}
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={action.isPending || pointsRemaining < cost}
                  onClick={() => run({ actionSlug: slug })}
                >
                  +Slot {lvl}º ({cost} pts)
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {level >= 2 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Metamagia conhecida:
          </p>
          {knownMetamagics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {knownMetamagics.map((option) => (
                <Button
                  key={option.slug}
                  type="button"
                  size="xs"
                  variant="secondary"
                  title={option.description}
                  disabled={
                    action.isPending || pointsRemaining < option.cost
                  }
                  onClick={() =>
                    run({
                      actionSlug: "use-metamagic",
                      metamagicSlug: option.slug,
                    })
                  }
                >
                  {option.name} ({option.cost} pt)
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nenhuma opção salva na ficha — escolha Metamagias na aba Magias /
              criação.
            </p>
          )}
        </div>
      ) : null}

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const powersContent =
    subclassActions.length > 0 || showBastion ? (
      <div className="space-y-2">
        <CombatPanelActionButtons
          actions={subclassActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          onAction={(slug) => run({ actionSlug: slug as never })}
        />

        {showBastion ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Bastião da Lei (1–5 Pontos → N d8 de proteção):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map((cost) => (
                <Button
                  key={cost}
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={action.isPending || pointsRemaining < cost}
                  onClick={() =>
                    run({ actionSlug: "bastion-of-law", pointsSpent: cost })
                  }
                >
                  {cost} pt → {cost}d8
                </Button>
              ))}
            </div>
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
      title="Combate do Feiticeiro (Fonte de Magia)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
