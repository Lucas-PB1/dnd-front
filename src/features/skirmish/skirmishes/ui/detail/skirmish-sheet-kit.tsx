"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useEconomyTableAction } from "@/features/character/character-sheet/api/use-economy-table-action";
import {
  groupClassEconomyActions,
  type ClassEconomyAction,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";
import { planEconomyTableUse } from "@/features/character/character-sheet/lib/combat/plan-economy-table-use";
import { ClassCombatPanel } from "@/features/character/character-sheet/ui/beyond/combat/class-combat-panel";
import { skirmishesKeys } from "@/features/skirmish/skirmishes/api/skirmishes.api";
import { useAppendSkirmishLog } from "@/features/skirmish/skirmishes/api/use-skirmishes";
import { useSkirmishSheetCombat } from "@/features/skirmish/skirmishes/ui/detail/use-skirmish-sheet-combat";
import { Button } from "@/shared/ui/button";

export function SkirmishSheetKit({
  characterId,
  skirmishId,
}: {
  characterId: string;
  skirmishId: string;
}) {
  const queryClient = useQueryClient();
  const {
    stateQuery,
    character,
    economyActions,
  } = useSkirmishSheetCombat(characterId);
  const tableAction = useEconomyTableAction(characterId);
  const appendLog = useAppendSkirmishLog(skirmishId);
  const [note, setNote] = useState<string | null>(null);

  const grouped = useMemo(
    () => groupClassEconomyActions(economyActions),
    [economyActions],
  );

  const remainingBySlug = useMemo(() => {
    const map = new Map<string, { remaining: number; max: number }>();
    for (const row of stateQuery.data?.classResources ?? []) {
      map.set(row.slug, { remaining: row.remaining, max: row.max });
    }
    return map;
  }, [stateQuery.data?.classResources]);

  const refreshSkirmish = () => {
    void queryClient.invalidateQueries({
      queryKey: skirmishesKeys.detail(skirmishId),
    });
  };

  const publishNote = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setNote(trimmed);
    appendLog.mutate(trimmed, {
      onSettled: () => refreshSkirmish(),
    });
  };

  const runEconomy = (action: ClassEconomyAction) => {
    const plan = planEconomyTableUse({
      action,
      remainingBySlug,
      preferSpendPool: false,
      missileShieldArmed: stateQuery.data?.missileShieldArmed ?? false,
      gigaMissileArmed: stateQuery.data?.gigaMissileArmed ?? false,
      mesaCircumstances: stateQuery.data?.mesaCircumstances ?? [],
      aberrantMutationActive: stateQuery.data?.aberrantMutationActive ?? null,
    });
    if (!action.tableAction && !action.itemSlug) return;
    if (!plan.canUse) return;
    tableAction.mutate(
      {
        tableAction: action.tableAction ?? action.id,
        actionId: action.id,
        classSlug: action.classSlug,
        featSlug: action.featSlug,
        resourceSlug: plan.counterSlug ?? undefined,
        spendAmount: 1,
        spellSlug: action.spellSlug,
        itemSlug: action.itemSlug,
      },
      {
        onSuccess: (result) => {
          if (result.note) publishNote(result.note);
          else refreshSkirmish();
        },
      },
    );
  };

  if (!character) {
    return (
      <p className="text-sm text-muted-foreground">Carregando ficha…</p>
    );
  }

  const buckets: Array<{
    key: keyof typeof grouped;
    title: string;
  }> = [
    { key: "action", title: "Ação" },
    { key: "bonus", title: "Ação bônus" },
    { key: "reaction", title: "Reação" },
    { key: "free", title: "Sem ação" },
  ];

  return (
    <div className="space-y-4">
      <ClassCombatPanel
        characterId={character.id}
        character={character}
        state={stateQuery.data}
        onTableNote={publishNote}
      />
      {economyActions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Economia de ação
          </p>
          {buckets.map((bucket) =>
            grouped[bucket.key].length === 0 ? null : (
              <ul key={bucket.key} className="space-y-1">
                <li className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {bucket.title}
                </li>
                {grouped[bucket.key].map((action) => {
                  const plan = planEconomyTableUse({
                    action,
                    remainingBySlug,
                    preferSpendPool: false,
                    missileShieldArmed:
                      stateQuery.data?.missileShieldArmed ?? false,
                    gigaMissileArmed:
                      stateQuery.data?.gigaMissileArmed ?? false,
                    mesaCircumstances:
                      stateQuery.data?.mesaCircumstances ?? [],
                    aberrantMutationActive:
                      stateQuery.data?.aberrantMutationActive ?? null,
                  });
                  const counter =
                    plan.counterSlug != null
                      ? remainingBySlug.get(plan.counterSlug)
                      : undefined;
                  const actionable = Boolean(
                    action.tableAction || action.itemSlug,
                  );
                  return (
                    <li
                      key={action.id}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <span>
                        {action.name}
                        {counter ? (
                          <span className="ml-1 font-mono text-xs text-muted-foreground">
                            {counter.remaining}/{counter.max}
                          </span>
                        ) : null}
                        {!actionable ? (
                          <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
                            Reserva — use Canalizar / Juramento
                          </span>
                        ) : null}
                      </span>
                      {actionable ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          disabled={
                            tableAction.isPending ||
                            appendLog.isPending ||
                            !plan.canUse
                          }
                          onClick={() => runEconomy(action)}
                        >
                          Usar
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ),
          )}
        </div>
      ) : null}
      {note ? (
        <p className="text-sm text-secondary" role="status">
          {note}
        </p>
      ) : null}
      {tableAction.isError ? (
        <p className="text-sm text-destructive">
          {tableAction.error instanceof Error
            ? tableAction.error.message
            : "Falha na economia de ação"}
        </p>
      ) : null}
    </div>
  );
}
