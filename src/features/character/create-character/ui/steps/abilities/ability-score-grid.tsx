"use client";

import { ABILITY_SCORE_KEYS } from "@/entities/character/lib/ability-score-keys";
import { abilityModifier, type AbilityScores } from "@/entities/character/types";
import {
  formatPoolOptionLabel,
  poolOptionsWithCounts,
  remainingPoolForAbility,
} from "@/features/character/create-character/lib/abilities/ability-pool";
import {
  formatPointBuyOptionLabel,
  pointBuyAffordableOptions,
  type PointBuyRules,
} from "@/features/character/create-character/lib/abilities/point-buy";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { useAbilityLabels } from "@/features/catalog/reference-catalog/api/use-ability-labels";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import type { UseFormSetValue } from "react-hook-form";

type AbilityScoreGridProps = {
  abilityScores: AbilityScores;
  hasRawPool: boolean;
  rawValues: number[] | undefined;
  isPointBuy: boolean;
  pointBuyRules: PointBuyRules | null;
  setValue: UseFormSetValue<CreateCharacterInput>;
  onPoolAssign: (key: keyof AbilityScores, raw: string) => void;
};

export function AbilityScoreGrid({
  abilityScores,
  hasRawPool,
  rawValues,
  isPointBuy,
  pointBuyRules,
  setValue,
  onPoolAssign,
}: AbilityScoreGridProps) {
  const { labelOf } = useAbilityLabels();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {ABILITY_SCORE_KEYS.map((key) => {
        const score = abilityScores[key];
        const poolOptions = hasRawPool
          ? poolOptionsWithCounts(
              remainingPoolForAbility(rawValues!, abilityScores, key),
            )
          : [];
        const pointBuyOptions =
          isPointBuy && pointBuyRules
            ? pointBuyAffordableOptions(abilityScores, key, pointBuyRules)
            : [];
        const label = labelOf(key);

        return (
          <div
            key={key}
            className="rounded-lg border border-border px-2.5 py-2"
          >
            <p className="text-xs font-medium">{label}</p>

            {isPointBuy && pointBuyRules ? (
              <SearchableSelect
                id={`ability-${key}`}
                aria-label={label}
                className="mt-1.5"
                options={pointBuyOptions.map((option) => ({
                  value: String(option),
                  label: formatPointBuyOptionLabel(option, pointBuyRules),
                }))}
                value={String(score)}
                onValueChange={(next) =>
                  setValue("abilityScores", {
                    ...abilityScores,
                    [key]: Number(next),
                  })
                }
              />
            ) : hasRawPool ? (
              <SearchableSelect
                id={`ability-${key}`}
                aria-label={label}
                className="mt-1.5"
                options={[
                  { value: "", label: "Escolher…" },
                  ...poolOptions.map((option) => ({
                    value: String(option.value),
                    label: formatPoolOptionLabel(option),
                  })),
                ]}
                value={score > 0 ? String(score) : ""}
                placeholder="Escolher…"
                onValueChange={(next) => onPoolAssign(key, next)}
              />
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">—</p>
            )}

            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {score > 0 ? abilityModifier(score) : "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
