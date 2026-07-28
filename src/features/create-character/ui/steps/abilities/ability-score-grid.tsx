"use client";

import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import {
  formatPoolOptionLabel,
  poolOptionsWithCounts,
  remainingPoolForAbility,
} from "@/features/create-character/lib/abilities/ability-pool";
import {
  ABILITY_KEYS,
  formatPointBuyOptionLabel,
  pointBuyAffordableOptions,
} from "@/features/create-character/lib/abilities/point-buy";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";
import type { UseFormSetValue } from "react-hook-form";

type AbilityScoreGridProps = {
  abilityScores: AbilityScores;
  hasRawPool: boolean;
  rawValues: number[] | undefined;
  isPointBuy: boolean;
  setValue: UseFormSetValue<CreateCharacterInput>;
  onPoolAssign: (key: keyof AbilityScores, raw: string) => void;
};

export function AbilityScoreGrid({
  abilityScores,
  hasRawPool,
  rawValues,
  isPointBuy,
  setValue,
  onPoolAssign,
}: AbilityScoreGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {ABILITY_KEYS.map((key) => {
        const score = abilityScores[key];
        const poolOptions = hasRawPool
          ? poolOptionsWithCounts(
              remainingPoolForAbility(rawValues!, abilityScores, key),
            )
          : [];
        const pointBuyOptions = isPointBuy
          ? pointBuyAffordableOptions(abilityScores, key)
          : [];

        return (
          <div
            key={key}
            className="rounded-lg border border-border px-2.5 py-2"
          >
            <p className="text-xs font-medium">{ABILITY_LABELS_PT[key]}</p>

            {isPointBuy ? (
              <select
                className={cn(nativeSelectClassName, "mt-1.5 h-8")}
                value={score}
                onChange={(e) =>
                  setValue("abilityScores", {
                    ...abilityScores,
                    [key]: Number(e.target.value),
                  })
                }
              >
                {pointBuyOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatPointBuyOptionLabel(option)}
                  </option>
                ))}
              </select>
            ) : hasRawPool ? (
              <select
                className={cn(nativeSelectClassName, "mt-1.5 h-8")}
                value={score > 0 ? score : ""}
                onChange={(e) => onPoolAssign(key, e.target.value)}
              >
                <option value="">Escolher…</option>
                {poolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {formatPoolOptionLabel(option)}
                  </option>
                ))}
              </select>
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
