"use client";

import { useMemo } from "react";

import type { ClassOption } from "@/entities/character/sheet-types";
import type { CharacterState } from "@/entities/character/session-types";
import {
  executeWarlockTableAction,
  type WarlockTableActionSlug,
} from "@/features/character/character-sheet/api/character-session.api";
import { useTableActionMutation } from "@/features/character/character-sheet/api/use-table-action-mutation";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";
import { readEldritchInvocationSlugs } from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { useEldritchInvocations } from "@/features/catalog/eldritch-invocation-catalog/api/use-eldritch-invocations";
import { CombatClassPanelShell } from "../shared/class-panel-shell";
import { CombatPanelActionButtons } from "../shared/panel-action-buttons";
import { CombatResourceSummary } from "../shared/resource-summary";
import { TableActionFeedback } from "../shared/table-action-feedback";

type CombatWarlockPanelProps = {
  characterId: string;
  classSlug: string;
  subclassSlug?: string | null;
  level: number;
  combatNotes?: string[];
  state: CharacterState | undefined;
  classOptions?: ClassOption[] | null;
};

export function CombatWarlockPanel({
  characterId,
  classSlug,
  subclassSlug,
  level,
  combatNotes,
  state,
  classOptions,
}: CombatWarlockPanelProps) {
  const action = useTableActionMutation(characterId, executeWarlockTableAction);
  const mechanicalCatalog = useCombatMechanicalCatalog({ classSlug, subclassSlug });
  const panelCatalog = mechanicalCatalog.data?.panelActions ?? [];
  const invocationsQuery = useEldritchInvocations(level);
  const knownSlugs = readEldritchInvocationSlugs(classOptions);

  const baseActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "warlock",
        level,
        subclassSlug,
        section: "base",
      }),
    [panelCatalog, level, subclassSlug],
  );
  const subclassActions = useMemo(
    () =>
      resolvePanelActions(panelCatalog, {
        classSlug: "warlock",
        level,
        subclassSlug,
        section: "subclass",
      }),
    [panelCatalog, level, subclassSlug],
  );

  const knownInvocations = useMemo(() => {
    const bySlug = new Map(
      (invocationsQuery.data ?? []).map((row) => [row.slug, row]),
    );
    return knownSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  }, [invocationsQuery.data, knownSlugs]);

  if (classSlug !== "warlock") return null;

  const resources = state?.classResources ?? [];

  function getRemaining(slug: string): number | null {
    return resources.find((entry) => entry.slug === slug)?.remaining ?? null;
  }

  const actionsContent = (
    <div className="space-y-2">
      <CombatResourceSummary
        resources={resources}
        slugs={["healing-light", "dark-ones-luck", "magical-cunning"]}
      />

      <CombatPanelActionButtons
        actions={baseActions}
        getRemaining={getRemaining}
        isPending={action.isPending}
        onAction={(slug) => action.mutate(slug as WarlockTableActionSlug)}
      />

      <TableActionFeedback
        lastResultNote={action.lastResult?.note}
        error={action.error}
      />
    </div>
  );

  const powersContent = (
    <div className="space-y-3">
      {subclassActions.length > 0 ? (
        <div className="space-y-2">
          <CombatPanelActionButtons
            actions={subclassActions}
            getRemaining={getRemaining}
            isPending={action.isPending}
            onAction={(slug) => action.mutate(slug as WarlockTableActionSlug)}
          />
          <TableActionFeedback
            lastResultNote={action.lastResult?.note}
            error={action.error}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          Invocações Místicas
        </p>
        {knownInvocations.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma selecionada — configure na aba Magias.
          </p>
        ) : (
          <ul className="space-y-1">
            {knownInvocations.map((row) =>
              row ? (
                <li key={row.slug} className="text-xs text-foreground">
                  <span className="font-medium">{row.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {row.kind}
                    {row.grantedSpellSlug
                      ? ` · ${row.grantedSpellSlug}`
                      : ""}
                  </span>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <CombatClassPanelShell
      title="Combate do Bruxo (Magia de Pacto)"
      actionsContent={actionsContent}
      powersContent={powersContent}
      combatNotes={combatNotes}
    />
  );
}
