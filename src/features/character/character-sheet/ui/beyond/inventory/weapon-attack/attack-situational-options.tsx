"use client";

import { cn } from "@/shared/lib/utils";

export type AttackCoverLevel = "none" | "half" | "three_quarters" | "full";

const COVER_OPTIONS: { id: AttackCoverLevel; label: string }[] = [
  { id: "none", label: "Sem cob." },
  { id: "half", label: "½ (+2 CA)" },
  { id: "three_quarters", label: "¾ (+5 CA)" },
  { id: "full", label: "Total" },
];

type AttackSituationalOptionsProps = {
  mode: "melee" | "ranged";
  targetCover: AttackCoverLevel;
  onTargetCoverChange: (value: AttackCoverLevel) => void;
  longRange: boolean;
  onLongRangeChange: (value: boolean) => void;
  meleeWithRanged: boolean;
  onMeleeWithRangedChange: (value: boolean) => void;
  targetAc: string;
  onTargetAcChange: (value: string) => void;
};

export function AttackSituationalOptions({
  mode,
  targetCover,
  onTargetCoverChange,
  longRange,
  onLongRangeChange,
  meleeWithRanged,
  onMeleeWithRangedChange,
  targetAc,
  onTargetAcChange,
}: AttackSituationalOptionsProps) {
  return (
    <div className="mt-2 space-y-2">
      <div
        className="flex flex-wrap gap-1"
        role="group"
        aria-label="Cobertura do alvo"
      >
        {COVER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={cn(
              "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
              targetCover === option.id
                ? "border-secondary/50 bg-secondary/15 text-secondary"
                : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
            )}
            aria-pressed={targetCover === option.id}
            onClick={() => onTargetCoverChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mode === "ranged" ? (
        <div className="flex flex-wrap gap-1" role="group" aria-label="Penalidades à distância">
          <button
            type="button"
            className={cn(
              "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
              longRange
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
            )}
            aria-pressed={longRange}
            onClick={() => onLongRangeChange(!longRange)}
          >
            Alcance longo
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
              meleeWithRanged
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
            )}
            aria-pressed={meleeWithRanged}
            onClick={() => onMeleeWithRangedChange(!meleeWithRanged)}
          >
            A 1,5 m
          </button>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
        <span className="shrink-0">CA alvo</span>
        <input
          type="number"
          min={1}
          max={40}
          inputMode="numeric"
          placeholder="opcional"
          value={targetAc}
          onChange={(event) => onTargetAcChange(event.target.value)}
          className="h-7 w-16 rounded-md border border-border/70 bg-muted/20 px-2 font-mono text-xs text-foreground"
        />
      </label>
    </div>
  );
}
