"use client";

import { ABILITY_LABELS_PT } from "@/entities/character/types";
import type { AbilityScores } from "@/entities/character/types";
import type { LevelUpAsiDistributionMode } from "@/entities/character/session-types";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { cn } from "@/shared/lib/utils";

const ABILITY_OPTIONS = (
  Object.entries(ABILITY_LABELS_PT) as [keyof AbilityScores, string][]
).map(([value, label]) => ({ value, label }));

type LevelUpAsiPickerProps = {
  scores: AbilityScores;
  mode: LevelUpAsiDistributionMode | "";
  primarySlug: string;
  secondarySlug: string;
  disabled?: boolean;
  onModeChange: (mode: LevelUpAsiDistributionMode | "") => void;
  onPrimaryChange: (slug: string) => void;
  onSecondaryChange: (slug: string) => void;
};

function canRaise(scores: AbilityScores, slug: string, delta: number): boolean {
  const key = slug as keyof AbilityScores;
  if (!(key in scores)) return false;
  return scores[key] + delta <= 20;
}

export function LevelUpAsiPicker({
  scores,
  mode,
  primarySlug,
  secondarySlug,
  disabled,
  onModeChange,
  onPrimaryChange,
  onSecondaryChange,
}: LevelUpAsiPickerProps) {
  const primaryDelta = mode === "plus2" ? 2 : 1;
  const primaryOptions = ABILITY_OPTIONS.filter((opt) =>
    canRaise(scores, opt.value, primaryDelta),
  ).map((opt) => ({
    value: opt.value,
    label: `${opt.label} (${scores[opt.value]})`,
  }));

  const secondaryOptions = ABILITY_OPTIONS.filter(
    (opt) =>
      opt.value !== primarySlug && canRaise(scores, opt.value, 1),
  ).map((opt) => ({
    value: opt.value,
    label: `${opt.label} (${scores[opt.value]})`,
  }));

  return (
    <div className="space-y-3">
      <p className="font-medium">Melhoria de atributo (ASI)</p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["", "Não aplicar ASI"],
            ["plus2", "+2 em um atributo"],
            ["plus1plus1", "+1 em dois atributos"],
          ] as const
        ).map(([value, label]) => {
          const selected = mode === value;
          return (
            <button
              key={value || "none"}
              type="button"
              disabled={disabled}
              onClick={() => {
                onModeChange(value);
                if (value !== "plus1plus1") onSecondaryChange("");
              }}
              className={cn(
                "rounded-md border px-2 py-1 text-xs transition-colors",
                selected
                  ? "border-primary/50 bg-primary/15 font-medium text-primary"
                  : "border-border/80 bg-muted/20 text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {mode ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <CatalogSelect
            id="level-up-asi-primary"
            label={mode === "plus2" ? "Atributo (+2)" : "Primeiro atributo (+1)"}
            options={primaryOptions}
            value={primarySlug}
            disabled={disabled}
            onChange={(e) => {
              onPrimaryChange(e.target.value);
              if (e.target.value === secondarySlug) onSecondaryChange("");
            }}
          />
          {mode === "plus1plus1" ? (
            <CatalogSelect
              id="level-up-asi-secondary"
              label="Segundo atributo (+1)"
              options={secondaryOptions}
              value={secondarySlug}
              disabled={disabled || !primarySlug}
              onChange={(e) => onSecondaryChange(e.target.value)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function isLevelUpAsiComplete(
  mode: LevelUpAsiDistributionMode | "",
  primarySlug: string,
  secondarySlug: string,
): boolean {
  if (!mode) return true;
  if (!primarySlug) return false;
  if (mode === "plus1plus1" && (!secondarySlug || secondarySlug === primarySlug)) {
    return false;
  }
  return true;
}
