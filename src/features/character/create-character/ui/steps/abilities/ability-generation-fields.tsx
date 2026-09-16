"use client";

import { useEffect, useMemo, useState } from "react";
import type { AbilityScores } from "@/entities/character/types";
import {
  sumAbilityValues,
  UNASSIGNED_ABILITY_SCORES,
} from "@/features/character/create-character/lib/abilities/ability-pool";
import {
  defaultPointBuyScores,
  parsePointBuyRules,
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
import { SearchableSelect } from "@/shared/ui/searchable-select";
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
    defaultValue: UNASSIGNED_ABILITY_SCORES,
  });
  const rawValues = useWatch({ control, name: "abilityRawValues" });
  const catalog = methods.data ?? [];
  const selectedMethod = catalog.find((row) => row.slug === method);
  const pointBuyRules = useMemo(
    () => parsePointBuyRules(selectedMethod),
    [selectedMethod],
  );
  const standardPool = catalog.find((row) => row.slug === "standard-array")
    ?.pool;
  const rollTotalMin = selectedMethod?.rollTotalMin;
  const rollTotalMax = selectedMethod?.rollTotalMax;
  const rollOptionCount = selectedMethod?.rollOptionCount ?? 3;

  const isPointBuy = method === "point-buy";
  const isRoll = method === "roll";
  const hasRawPool = !isPointBuy && rawValues && rawValues.length === 6;
  const rawTotal = hasRawPool ? sumAbilityValues(rawValues) : null;
  const spent =
    isPointBuy && pointBuyRules ? pointBuySpent(abilityScores, pointBuyRules) : 0;
  const remaining =
    isPointBuy && pointBuyRules
      ? pointBuyRemaining(abilityScores, pointBuyRules)
      : 0;

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
      const rules = parsePointBuyRules(
        catalog.find((row) => row.slug === "point-buy"),
      );
      setValue("abilityRawValues", undefined);
      setValue(
        "abilityScores",
        rules
          ? defaultPointBuyScores(rules)
          : { ...UNASSIGNED_ABILITY_SCORES },
      );
      return;
    }
    if (next === "standard-array") {
      const pool = catalog.find((row) => row.slug === "standard-array")?.pool;
      if (pool?.length === 6) {
        applyPool([...pool]);
        return;
      }
      setValue("abilityRawValues", undefined);
      setValue("abilityScores", { ...UNASSIGNED_ABILITY_SCORES });
      return;
    }
    setValue("abilityRawValues", undefined);
    setValue("abilityScores", { ...UNASSIGNED_ABILITY_SCORES });
  }

  useEffect(() => {
    if (method !== "standard-array") return;
    if (rawValues?.length === 6) return;
    if (!standardPool || standardPool.length !== 6) return;
    setValue("abilityRawValues", [...standardPool]);
    setValue("abilityScores", { ...UNASSIGNED_ABILITY_SCORES });
  }, [method, rawValues, standardPool, setValue]);

  useEffect(() => {
    if (method !== "point-buy" || !pointBuyRules) return;
    const unassigned = Object.values(abilityScores).every((value) => value === 0);
    if (!unassigned) return;
    setValue("abilityScores", defaultPointBuyScores(pointBuyRules));
  }, [method, pointBuyRules, abilityScores, setValue]);

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
          <SearchableSelect
            id="abilityGenerationMethodSlug"
            value={method}
            options={
              methods.isPending || !catalog.length
                ? [
                    { value: "standard-array", label: "Conjunto padrão" },
                    { value: "roll", label: "Rolagem 4d6" },
                    { value: "point-buy", label: "Compra de pontos" },
                  ]
                : catalog.map((row) => ({
                    value: row.slug,
                    label: row.name,
                  }))
            }
            onValueChange={(next) =>
              applyMethodChange(
                next as CreateCharacterInput["abilityGenerationMethodSlug"],
              )
            }
          />
        </Field>

        {isRoll ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleRoll}
            disabled={roll.isPending}
          >
            {roll.isPending
              ? "Rolando…"
              : `Rolar ${rollOptionCount} opções`}
          </Button>
        ) : null}

        {isPointBuy && pointBuyRules ? (
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
            {spent}/{pointBuyRules.budget} pontos · resta {remaining}
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
            {rollTotalMin != null && rollTotalMax != null
              ? `Escolha um dos conjuntos (soma entre ${rollTotalMin} e ${rollTotalMax}):`
              : "Escolha um dos conjuntos:"}
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
        pointBuyRules={pointBuyRules}
        setValue={setValue}
        onPoolAssign={handlePoolAssign}
      />
    </WizardFormSection>
  );
}
