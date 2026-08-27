"use client";

import { useMemo, useState } from "react";

import type { CharacterThreadRank } from "@/entities/character-thread/types";
import {
  useCharacterThreadDetail,
  useCharacterThreads,
} from "@/features/catalog/character-thread-catalog/api/use-character-threads";
import {
  useAbandonCharacterThread,
  useAttachCharacterThread,
  useCompleteCharacterThread,
  useReachCharacterThreadMilestone,
  useSetCharacterThreadGoal,
} from "@/features/character/character-sheet/api/use-character-thread";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";

const RANK_LABEL: Record<CharacterThreadRank, string> = {
  least: "Least",
  lesser: "Lesser",
  greater: "Greater",
  superior: "Superior",
};

const RANKS: CharacterThreadRank[] = [
  "least",
  "lesser",
  "greater",
  "superior",
];

export function CharacterThreadSection({ character }: SheetReadSectionProps) {
  const bundle = character.thread ?? { active: null, history: [] };
  const active = bundle.active;
  const catalog = useCharacterThreads(true);
  const detail = useCharacterThreadDetail(
    active?.threadSlug ?? "",
    !!active?.threadSlug,
  );
  const attach = useAttachCharacterThread(character.id);
  const setGoal = useSetCharacterThreadGoal(character.id);
  const reach = useReachCharacterThreadMilestone(character.id);
  const complete = useCompleteCharacterThread(character.id);
  const abandon = useAbandonCharacterThread(character.id);

  const [pickSlug, setPickSlug] = useState("");
  const [goalIndex, setGoalIndex] = useState<number | "">("");
  const [pendingRank, setPendingRank] = useState<CharacterThreadRank | "">("");
  const [pendingBenefit, setPendingBenefit] = useState("");

  const pendingMilestone = useMemo(() => {
    if (!pendingRank || !detail.data) return null;
    return detail.data.milestones.find((row) => row.rank === pendingRank) ?? null;
  }, [detail.data, pendingRank]);

  const choiceBenefits = useMemo(() => {
    if (!pendingMilestone) return [];
    return pendingMilestone.benefits.filter((b) => b.choiceGroup != null);
  }, [pendingMilestone]);

  const items = useMemo((): DetailTileItem[] => {
    if (!active) return [];
    const next: DetailTileItem[] = [];
    next.push({
      id: "summary",
      title: active.threadName ?? active.threadSlug,
      subtitle: "Ativo",
      body: detail.data?.summary ? (
        <PhbProse text={detail.data.summary} />
      ) : (
        <p className="text-sm text-muted-foreground">Character Thread ativo.</p>
      ),
    });
    if (active.goalText) {
      next.push({
        id: "goal",
        title: "Objetivo",
        body: <p className="text-sm">{active.goalText}</p>,
      });
    }
    if (detail.data?.specialRulesText) {
      next.push({
        id: "special",
        title: "Regras especiais",
        body: <PhbProse text={detail.data.specialRulesText} />,
      });
    }
    if (active.milestones.length > 0) {
      next.push({
        id: "benefits",
        title: "Benefícios alcançados",
        subtitle: `${active.milestones.length}`,
        body: (
          <ul className="space-y-2">
            {active.milestones.map((milestone) => (
              <li key={`${milestone.rank}:${milestone.benefitKey}`}>
                <p className="text-sm font-medium">
                  {RANK_LABEL[milestone.rank as CharacterThreadRank] ??
                    milestone.rank}
                  : {milestone.benefitName ?? milestone.benefitKey}
                </p>
                {milestone.benefitDescription ? (
                  <p className="text-xs text-muted-foreground">
                    {milestone.benefitDescription}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ),
      });
    }
    return next;
  }, [active, detail.data]);

  if (!active) {
    const options = catalog.data?.data ?? [];
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Nenhum Character Thread ativo (opcional — Northlands).
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-muted-foreground">
              Thread
            </span>
            <select
              className="rounded-md border border-border bg-background px-2 py-1.5"
              value={pickSlug}
              onChange={(event) => setPickSlug(event.target.value)}
            >
              <option value="">—</option>
              {options.map((thread) => (
                <option key={thread.slug} value={thread.slug}>
                  {thread.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            disabled={!pickSlug || attach.isPending}
            onClick={() => attach.mutate({ threadSlug: pickSlug })}
          >
            Anexar
          </Button>
        </div>
        {attach.isError ? (
          <p className="text-sm text-destructive" role="alert">
            {(attach.error as Error).message}
          </p>
        ) : null}
        {bundle.history.length > 0 ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Histórico
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {bundle.history.map((row) => (
                <li key={row.id}>
                  <SheetChip>
                    {row.threadName ?? row.threadSlug} ({row.status})
                  </SheetChip>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DetailTileGrid
        items={items}
        hint="Toque em um item para ver detalhes."
      />

      <div className="space-y-2 rounded-md border border-border/60 p-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Objetivo
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Modelo (1–6)</span>
            <select
              className="rounded-md border border-border bg-background px-2 py-1.5"
              value={goalIndex}
              onChange={(event) =>
                setGoalIndex(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
            >
              <option value="">Livre / manter</option>
              {(detail.data?.goals ?? []).map((goal) => (
                <option key={goal.sortOrder} value={goal.sortOrder}>
                  {goal.sortOrder}. {goal.text}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={goalIndex === "" || setGoal.isPending}
            onClick={() =>
              setGoal.mutate({
                goalIndex: typeof goalIndex === "number" ? goalIndex : null,
              })
            }
          >
            Definir goal
          </Button>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-border/60 p-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Milestone (GM)
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[8rem] flex-col gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Rank</span>
            <select
              className="rounded-md border border-border bg-background px-2 py-1.5"
              value={pendingRank}
              onChange={(event) => {
                setPendingRank(
                  (event.target.value || "") as CharacterThreadRank | "",
                );
                setPendingBenefit("");
              }}
            >
              <option value="">—</option>
              {RANKS.map((rank) => (
                <option key={rank} value={rank}>
                  {RANK_LABEL[rank]}
                </option>
              ))}
            </select>
          </label>
          {choiceBenefits.length > 0 ? (
            <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Benefício</span>
              <select
                className="rounded-md border border-border bg-background px-2 py-1.5"
                value={pendingBenefit}
                onChange={(event) => setPendingBenefit(event.target.value)}
              >
                <option value="">—</option>
                {choiceBenefits.map((benefit) => (
                  <option key={benefit.benefitKey} value={benefit.benefitKey}>
                    {benefit.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={
              !pendingRank ||
              reach.isPending ||
              (choiceBenefits.length > 0 && !pendingBenefit)
            }
            onClick={() =>
              reach.mutate({
                rank: pendingRank as CharacterThreadRank,
                benefitKeys: pendingBenefit ? [pendingBenefit] : [],
              })
            }
          >
            Marcar milestone
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={complete.isPending}
          onClick={() => complete.mutate()}
        >
          Completar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={abandon.isPending}
          onClick={() => {
            if (
              window.confirm(
                "Abandonar remove todos os benefícios deste thread. Continuar?",
              )
            ) {
              abandon.mutate();
            }
          }}
        >
          Abandonar
        </Button>
      </div>
    </div>
  );
}
