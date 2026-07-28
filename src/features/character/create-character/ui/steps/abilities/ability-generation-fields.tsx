"use client";

import { useState } from "react";
import type { AbilityScores } from "@/entities/character/types";
import {
  STANDARD_ARRAY_VALUES,
  sumAbilityValues,
  UNASSIGNED_ABILITY_SCORES,
} from "@/features/character/create-character/lib/abilities/ability-pool";
import {
  DEFAULT_ABILITY_SCORES,
  POINT_BUY_BUDGET,
  POINT_BUY_DEFAULT,
  pointBuyRemaining,
  pointBuySpent,
} from "@/features/character/create-character/lib/abilities/point-buy";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { AbilityScoreGrid } from "@/features/character/create-character/ui/steps/abilities/ability-score-grid";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { useAbilityGenerationMethods } from "@/features/catalog/reference-catalog/api/use-reference";
import { useRollAbilities } from "@/features/character/character-sheet/api/use-roll-abilities";
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

      <AbilityScoreGrid
        abilityScores={abilityScores}
        hasRawPool={!!hasRawPool}
        rawValues={rawValues}
        isPointBuy={isPointBuy}
        setValue={setValue}
        onPoolAssign={handlePoolAssign}
      />
    </WizardFormSection>
  );
}
