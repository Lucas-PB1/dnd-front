"use client";

import { useState } from "react";
import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import {
  formatPoolOptionLabel,
  poolOptionsWithCounts,
  remainingPoolForAbility,
  STANDARD_ARRAY_VALUES,
  sumAbilityValues,
  UNASSIGNED_ABILITY_SCORES,
} from "@/features/create-character/lib/ability-pool";
import {
  ABILITY_KEYS,
  DEFAULT_ABILITY_SCORES,
  formatPointBuyOptionLabel,
  POINT_BUY_BUDGET,
  POINT_BUY_DEFAULT,
  pointBuyAffordableOptions,
  pointBuyRemaining,
  pointBuySpent,
} from "@/features/create-character/lib/point-buy";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { useAbilityGenerationMethods } from "@/features/reference-catalog/api/use-reference";
import { useRollAbilities } from "@/features/character-sheet/api/use-roll-abilities";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

type AbilityGenerationFieldsProps = {
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function AbilityGenerationFields({
  control,
  errors,
  setValue,
}: AbilityGenerationFieldsProps) {
  const roll = useRollAbilities();
  const methods = useAbilityGenerationMethods();
  const [rollOptions, setRollOptions] = useState<number[][] | null>(null);
  const method = useWatch({
    control,
    name: "abilityGenerationMethodSlug",
    defaultValue: "standard-array",
  });
  const abilityScores = useWatch({
    control,
    name: "abilityScores",
    defaultValue: DEFAULT_ABILITY_SCORES,
  });
  const rawValues = useWatch({ control, name: "abilityRawValues" });

  const isPointBuy = method === "point-buy";
  const isRoll = method === "roll";
  const hasRawPool = !isPointBuy && rawValues && rawValues.length === 6;
  const rawTotal = hasRawPool ? sumAbilityValues(rawValues) : null;
  const spent = isPointBuy ? pointBuySpent(abilityScores) : 0;
  const remaining = isPointBuy ? pointBuyRemaining(abilityScores) : 0;

  function applyPool(values: number[]) {
    setValue("abilityRawValues", values);
    setValue("abilityScores", { ...UNASSIGNED_ABILITY_SCORES });
  }

  function applyMethodChange(
    next: CreateCharacterInput["abilityGenerationMethodSlug"],
  ) {
    setValue("abilityGenerationMethodSlug", next);
    setRollOptions(null);
    if (next === "point-buy") {
      setValue("abilityRawValues", undefined);
      setValue("abilityScores", { ...POINT_BUY_DEFAULT });
      return;
    }
    if (next === "standard-array") {
      applyPool([...STANDARD_ARRAY_VALUES]);
      return;
    }
    setValue("abilityRawValues", undefined);
    setValue("abilityScores", { ...UNASSIGNED_ABILITY_SCORES });
  }

  function handleRoll() {
    roll.mutate(
      { method: "roll" },
      {
        onSuccess: (result) => {
          const options =
            result.rawValueOptions?.filter((row) => row.length === 6) ??
            (result.rawValues?.length === 6 ? [result.rawValues] : []);
          setRollOptions(options);
          setValue("abilityRawValues", undefined);
          setValue("abilityScores", { ...UNASSIGNED_ABILITY_SCORES });
        },
      },
    );
  }

  function handlePoolAssign(key: keyof AbilityScores, raw: string) {
    if (!rawValues?.length) return;
    const nextValue = raw === "" ? 0 : Number(raw);
    setValue("abilityScores", {
      ...abilityScores,
      [key]: Number.isFinite(nextValue) ? nextValue : 0,
    });
  }

  return (
    <WizardFormSection title="Atributos" compact>
      <div className="flex flex-wrap items-end gap-3">
        <Field className="min-w-[12rem] flex-1">
          <FieldLabel htmlFor="abilityGenerationMethodSlug">Método</FieldLabel>
          <select
            id="abilityGenerationMethodSlug"
            className={nativeSelectClassName}
            value={method}
            onChange={(e) =>
              applyMethodChange(
                e.target
                  .value as CreateCharacterInput["abilityGenerationMethodSlug"],
              )
            }
          >
            {methods.isPending || !methods.data?.length ? (
              <>
                <option value="standard-array">Conjunto padrão</option>
                <option value="roll">Rolagem 4d6</option>
                <option value="point-buy">Compra de pontos</option>
              </>
            ) : (
              methods.data.map((row) => (
                <option key={row.slug} value={row.slug}>
                  {row.name}
                </option>
              ))
            )}
          </select>
        </Field>

        {isRoll ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleRoll}
            disabled={roll.isPending}
          >
            {roll.isPending ? "Rolando…" : "Rolar 3 opções"}
          </Button>
        ) : null}

        {isPointBuy ? (
          <p
            className={cn(
              "pb-2 text-xs tabular-nums",
              remaining === 0
                ? "text-foreground"
                : remaining < 0
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {spent}/{POINT_BUY_BUDGET} pontos · resta {remaining}
          </p>
        ) : null}

        {hasRawPool ? (
          <p className="pb-2 text-xs text-muted-foreground">
            Pool: {rawValues.join(", ")}
            {rawTotal != null ? ` · Σ ${rawTotal}` : null}
          </p>
        ) : null}
      </div>

      {roll.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {roll.error instanceof Error
            ? roll.error.message
            : "Erro ao gerar atributos"}
        </p>
      ) : null}

      {isRoll && rollOptions && rollOptions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Escolha um dos três conjuntos (soma entre 72 e 80):
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {rollOptions.map((option, index) => {
              const total = sumAbilityValues(option);
              const selected =
                hasRawPool &&
                option.length === rawValues.length &&
                option.every((value, i) => value === rawValues[i]);
              return (
                <button
                  key={`roll-option-${index}`}
                  type="button"
                  onClick={() => applyPool(option)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <p className="text-xs font-medium">Opção {index + 1}</p>
                  <p className="mt-1 font-mono text-sm tabular-nums">
                    {option.join(" · ")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Σ {total}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <FieldError errors={[errors.abilityScores]} />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITY_KEYS.map((key) => {
          const score = abilityScores[key];
          const poolOptions = hasRawPool
            ? poolOptionsWithCounts(
                remainingPoolForAbility(rawValues, abilityScores, key),
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
                  onChange={(e) => handlePoolAssign(key, e.target.value)}
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
    </WizardFormSection>
  );
}
