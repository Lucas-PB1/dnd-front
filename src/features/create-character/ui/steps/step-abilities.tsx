"use client";

import { useEffect, useMemo, useState } from "react";
import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import {
  buildBackgroundAbilityBoostOptions,
  isBackgroundAbilityBoostAllowed,
} from "@/entities/background/lib/background-ability-options";
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
import {
  useBackgroundDetail,
  useBackgrounds,
} from "@/features/background-catalog/api/use-backgrounds";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
  BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
  previewBackgroundAbilityBoosts,
} from "@/entities/character/lib/background-boost";
import { useAbilityGenerationMethods } from "@/features/reference-catalog/api/use-reference";
import { useRollAbilities } from "@/features/character-sheet/api/use-roll-abilities";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

type StepAbilitiesProps = {
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepAbilities({
  control,
  errors,
  setValue,
}: StepAbilitiesProps) {
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
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const boostPlus2 = useWatch({
    control,
    name: "backgroundAbilityBoostPlus2Slug",
    defaultValue: "",
  });
  const boostPlus1 = useWatch({
    control,
    name: "backgroundAbilityBoostPlus1Slug",
    defaultValue: "",
  });
  const boostMode = useWatch({
    control,
    name: "backgroundAbilityBoostMode",
    defaultValue: "plus2plus1",
  });
  const boostPlus1Slugs = useWatch({
    control,
    name: "backgroundAbilityBoostPlus1Slugs",
    defaultValue: ["", "", ""],
  });
  const rawValues = useWatch({ control, name: "abilityRawValues" });

  const backgrounds = useBackgrounds();
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const selectedBackground = backgrounds.data?.data.find(
    (b) => b.slug === backgroundSlug,
  );

  const allowedSlugs = useMemo(
    () =>
      backgroundDetail.data?.abilityOptionSlugs ??
      selectedBackground?.abilityOptionSlugs ??
      [],
    [
      backgroundDetail.data?.abilityOptionSlugs,
      selectedBackground?.abilityOptionSlugs,
    ],
  );

  const boostOptions = useMemo(
    () =>
      buildBackgroundAbilityBoostOptions(
        allowedSlugs,
        backgroundDetail.data?.abilityOptionNames ??
          selectedBackground?.abilityOptionNames,
      ),
    [
      allowedSlugs,
      backgroundDetail.data?.abilityOptionNames,
      selectedBackground?.abilityOptionNames,
    ],
  );

  const allowedSlugSet = useMemo(() => new Set(allowedSlugs), [allowedSlugs]);

  const boostPlus2Value = isBackgroundAbilityBoostAllowed(
    boostPlus2,
    allowedSlugs,
  )
    ? boostPlus2
    : "";
  const boostPlus1Value = isBackgroundAbilityBoostAllowed(
    boostPlus1,
    allowedSlugs,
  )
    ? boostPlus1
    : "";

  useEffect(() => {
    if (boostPlus2 && !allowedSlugSet.has(boostPlus2)) {
      setValue("backgroundAbilityBoostPlus2Slug", "");
    }
    if (boostPlus1 && !allowedSlugSet.has(boostPlus1)) {
      setValue("backgroundAbilityBoostPlus1Slug", "");
    }
    const nextPlus1Slugs = (boostPlus1Slugs ?? []).map((slug) =>
      slug && allowedSlugSet.has(slug) ? slug : "",
    );
    if (
      nextPlus1Slugs.length === 3 &&
      nextPlus1Slugs.some((slug, index) => slug !== (boostPlus1Slugs ?? [])[index])
    ) {
      setValue("backgroundAbilityBoostPlus1Slugs", nextPlus1Slugs);
    }
  }, [
    allowedSlugSet,
    boostPlus1,
    boostPlus1Slugs,
    boostPlus2,
    setValue,
  ]);

  const boostOptionsLoading =
    !!backgroundSlug && backgroundDetail.isPending && boostOptions.length === 0;

  const plus1x3Complete =
    (boostPlus1Slugs ?? []).filter((slug) => !!slug?.trim()).length === 3 &&
    new Set((boostPlus1Slugs ?? []).filter((slug) => !!slug?.trim())).size ===
      3;

  const previewScores =
    boostMode === BACKGROUND_BOOST_MODE_PLUS1X3
      ? plus1x3Complete
        ? previewBackgroundAbilityBoosts(abilityScores, {
            mode: BACKGROUND_BOOST_MODE_PLUS1X3,
            plus1Slugs: (boostPlus1Slugs ?? []) as (keyof AbilityScores)[],
          })
        : null
      : boostPlus2 && boostPlus1 && boostPlus2 !== boostPlus1
        ? previewBackgroundAbilityBoosts(abilityScores, {
            mode: BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
            plus2Slug: boostPlus2 as keyof AbilityScores,
            plus1Slug: boostPlus1 as keyof AbilityScores,
          })
        : null;

  function applyBoostMode(
    next: CreateCharacterInput["backgroundAbilityBoostMode"],
  ) {
    setValue("backgroundAbilityBoostMode", next);
    if (next === BACKGROUND_BOOST_MODE_PLUS1X3) {
      setValue("backgroundAbilityBoostPlus2Slug", "");
      setValue("backgroundAbilityBoostPlus1Slug", "");
      const auto =
        allowedSlugs.length === 3 ? [...allowedSlugs] : ["", "", ""];
      setValue("backgroundAbilityBoostPlus1Slugs", auto);
      return;
    }
    setValue("backgroundAbilityBoostPlus1Slugs", ["", "", ""]);
  }

  function setPlus1x3Slug(index: number, value: string) {
    const current = [...(boostPlus1Slugs ?? ["", "", ""])];
    while (current.length < 3) current.push("");
    current[index] = value;
    setValue("backgroundAbilityBoostPlus1Slugs", current);
  }

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

  function handleSelectRollOption(values: number[]) {
    applyPool(values);
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
    <div className="space-y-3">
      <WizardFormSection title="Atributos" compact>
        <div className="flex flex-wrap items-end gap-3">
          <Field className="min-w-[12rem] flex-1">
            <FieldLabel htmlFor="abilityGenerationMethodSlug">
              Método
            </FieldLabel>
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
                    onClick={() => handleSelectRollOption(option)}
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

      {backgroundSlug && boostOptions.length > 0 ? (
        <WizardFormSection
          key={backgroundSlug}
          title={`Bônus · ${selectedBackground?.name ?? "Antecedente"}`}
          compact
        >
          <Field className="max-w-sm">
            <FieldLabel htmlFor="background-boost-mode">Distribuição</FieldLabel>
            <select
              id="background-boost-mode"
              className={nativeSelectClassName}
              value={boostMode}
              onChange={(e) =>
                applyBoostMode(
                  e.target
                    .value as CreateCharacterInput["backgroundAbilityBoostMode"],
                )
              }
            >
              <option value={BACKGROUND_BOOST_MODE_PLUS2_PLUS1}>
                +2 em um e +1 em outro
              </option>
              <option value={BACKGROUND_BOOST_MODE_PLUS1X3}>
                +1 em três atributos
              </option>
            </select>
          </Field>

          {boostMode === BACKGROUND_BOOST_MODE_PLUS1X3 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((index) => {
                const selected = (boostPlus1Slugs ?? [])[index] ?? "";
                const taken = new Set(
                  (boostPlus1Slugs ?? []).filter(
                    (slug, i) => i !== index && !!slug,
                  ),
                );
                return (
                  <CatalogSelect
                    key={`plus1x3-${index}`}
                    id={`background-boost-plus1-${index}`}
                    label={`+1 (${index + 1})`}
                    options={boostOptions.filter(
                      (option) =>
                        option.value === selected || !taken.has(option.value),
                    )}
                    isLoading={boostOptionsLoading}
                    value={
                      isBackgroundAbilityBoostAllowed(selected, allowedSlugs)
                        ? selected
                        : ""
                    }
                    onChange={(e) => setPlus1x3Slug(index, e.target.value)}
                    error={
                      index === 0
                        ? errors.backgroundAbilityBoostPlus1Slugs
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <CatalogSelect
                id="background-boost-plus2"
                label="+2"
                options={boostOptions}
                isLoading={boostOptionsLoading}
                value={boostPlus2Value}
                onChange={(e) =>
                  setValue("backgroundAbilityBoostPlus2Slug", e.target.value)
                }
                error={errors.backgroundAbilityBoostPlus2Slug}
              />
              <CatalogSelect
                id="background-boost-plus1"
                label="+1"
                options={boostOptions.filter(
                  (o) => o.value !== boostPlus2Value,
                )}
                isLoading={boostOptionsLoading}
                value={boostPlus1Value}
                onChange={(e) =>
                  setValue("backgroundAbilityBoostPlus1Slug", e.target.value)
                }
                error={errors.backgroundAbilityBoostPlus1Slug}
              />
            </div>
          )}

          {previewScores ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {ABILITY_KEYS.map((key) => (
                <span key={key}>
                  <span className="text-muted-foreground">
                    {ABILITY_LABELS_PT[key]}{" "}
                  </span>
                  <span className="font-medium tabular-nums">
                    {previewScores[key]}
                  </span>
                  {previewScores[key] !== abilityScores[key] ? (
                    <span className="text-primary">
                      {" "}
                      (+{previewScores[key] - abilityScores[key]})
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}
        </WizardFormSection>
      ) : backgroundSlug && !boostOptionsLoading ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível carregar os atributos deste antecedente.
        </p>
      ) : null}
    </div>
  );
}
