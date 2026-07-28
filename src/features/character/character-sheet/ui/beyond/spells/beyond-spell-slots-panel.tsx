"use client";

import { StopCircleIcon } from "@heroicons/react/24/outline";

import type { CharacterState } from "@/entities/character/session-types";
import type { CharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { SheetSlotPips } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";

type SpellSlotSummary = {
  level: number;
  max: number;
  used: number;
  remaining: number;
};

type BeyondSpellSlotsPanelProps = {
  isPending: boolean;
  activeSlots: SpellSlotSummary[];
  state: CharacterState | undefined;
  labels: CharacterCatalogLabels;
  isClearingConcentration: boolean;
  onClearConcentration: () => void;
};

export function BeyondSpellSlotsPanel({
  isPending,
  activeSlots,
  state,
  labels,
  isClearingConcentration,
  onClearConcentration,
}: BeyondSpellSlotsPanelProps) {
  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando slots…</p>
    );
  }

  return (
    <div className="space-y-3 border-b border-border/50 pb-3">
      {activeSlots.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {activeSlots.map((slot) => (
            <li
              key={slot.level}
              className="flex min-w-[5.5rem] flex-col gap-1 rounded-lg border border-border/70 bg-background/40 px-2.5 py-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {slot.level}º
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {slot.remaining}/{slot.max}
                </span>
              </div>
              <SheetSlotPips max={slot.max} used={slot.used} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sem espaços de magia neste nível.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Concentração
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {state?.concentratingOn
              ? labels.resolveSpell(state.concentratingOn)
              : "Nenhuma"}
          </p>
        </div>
        {state?.concentratingOn ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            disabled={isClearingConcentration}
            onClick={onClearConcentration}
          >
            <StopCircleIcon className="size-3.5" aria-hidden />
            {isClearingConcentration ? "Limpando…" : "Encerrar"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
