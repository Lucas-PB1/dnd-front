"use client";

import { useEffect, useMemo, useState } from "react";

import type { CharacterState } from "@/entities/character/session-types";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  executeBardTableAction,
  type BardTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { TableActionFeedback } from "../shared/table-action-feedback";
import { Button } from "@/shared/ui/button";

const EMPTY_PANEL_ACTIONS: ClassPanelActionRecord[] = [];

type CombatBardPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
};

function isBardicInspirationSlug(slug: string): boolean {
  return slug === "bardicInspiration" || slug === "bardic-inspiration";
}

function maxEquippedMasks(level: number): number {
  return level >= 14 ? 2 : 1;
}

/**
 * Bardo: base/colégio pelo catálogo C010; Inspiração ± só na Economia; máscaras no painel.
 */
export function CombatBardPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
}: CombatBardPanelProps) {
  const enabled = classSlug === "bard";
  const action = useTableActionMutation(characterId, executeBardTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({
    classSlug,
    subclassSlug,
  });
  const personaMasks = mechanicalCatalog.data?.personaMasks ?? [];
  const panelCatalog =
    mechanicalCatalog.data?.panelActions ?? EMPTY_PANEL_ACTIONS;

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "bard",
        level,
        subclassSlug,
        section: "base",
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "bard",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  const isMasks = subclassSlug === "college-of-masks" && level >= 3;
  const activeMasks = state?.personaMasks ?? [];
  const maxMasks = maxEquippedMasks(level);
  const [draftMasks, setDraftMasks] = useState<string[]>(activeMasks);
  const activeKey = activeMasks.join("|");

  useEffect(() => {
    setDraftMasks(activeMasks);
  }, [activeKey]);

  const maskLabelBySlug = useMemo(() => {
    const map = new Map(personaMasks.map((mask) => [mask.slug, mask.name]));
    return (slug: string) => map.get(slug) ?? slug;
  }, [personaMasks]);

  const activeLabels = useMemo(
    () => activeMasks.map(maskLabelBySlug).join(", "),
    [activeKey, maskLabelBySlug],
  );

  if (!enabled) return null;

  const resources = state?.classResources ?? [];
  const bardicResource = resources.find((item) =>
    isBardicInspirationSlug(item.slug),
  );
  const remaining = bardicResource?.remaining ?? 0;

  function getRemaining(slug: string): number | null {
    if (isBardicInspirationSlug(slug)) return remaining;
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  function toggleDraftMask(slug: string) {
    setDraftMasks((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= maxMasks) {
        return [...current.slice(1), slug];
      }
      return [...current, slug];
    });
  }

  const masksContent = isMasks ? (
    <div className="space-y-2 rounded-md border border-border/60 p-2">
      <p className="text-sm text-muted-foreground">
        Máscaras ativas ({activeMasks.length}/{maxMasks}):{" "}
        <span className="font-medium text-foreground">
          {activeLabels || "nenhuma"}
        </span>
      </p>
      <div className="grid gap-1 sm:grid-cols-2">
        {personaMasks.map((mask) => {
          const checked = draftMasks.includes(mask.slug);
          return (
            <label
              key={mask.slug}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={action.isPending || !state}
                onChange={() => toggleDraftMask(mask.slug)}
              />
              {mask.name}
            </label>
          );
        })}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={action.isPending || !state}
        title="Ação Bônus: vestir ou trocar máscaras de persona"
        onClick={() =>
          action.mutate({
            actionSlug: "set-persona-masks",
            masks: draftMasks,
          })
        }
      >
        Vestir
      </Button>
    </div>
  ) : null;

  const actionsContent = (
    <div className="space-y-2">
      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        disabled={!state}
        onAction={(slug) =>
          action.mutate({ actionSlug: slug as BardTableActionSlug })
        }
      />
      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const powersContent =
    subclassActions.length > 0 || masksContent ? (
      <div className="space-y-2">
        {masksContent}
        <CombatPanelActionButtons
          actions={subclassActions}
          getRemaining={getRemaining}
          isPending={action.isPending}
          disabled={!state}
          onAction={(slug) =>
            action.mutate({ actionSlug: slug as BardTableActionSlug })
          }
        />
        <TableActionFeedback
          lastResultNote={action.lastResult?.note}
          error={action.error}
        />
      </div>
    ) : null;

  return (
    <CombatClassPanelShell
      title="Bardo"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
