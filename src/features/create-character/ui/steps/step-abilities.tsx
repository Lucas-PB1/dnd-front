"use client";

import { useEffect, useMemo } from "react";
import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import {
  buildBackgroundAbilityBoostOptions,
  isBackgroundAbilityBoostAllowed,
} from "@/entities/background/lib/background-ability-options";
import {
  ABILITY_KEYS,
  DEFAULT_ABILITY_SCORES,
  POINT_BUY_DEFAULT,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  pointBuyRemaining,
  pointBuySpent,
} from "@/features/create-character/lib/point-buy";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  useBackgroundDetail,
  useBackgrounds,
} from "@/features/background-catalog/api/use-backgrounds";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { previewBackgroundAbilityBoosts } from "@/entities/character/lib/background-boost";
import { useRollAbilities } from "@/features/character-sheet/api/use-roll-abilities";
import { Button } from "@/shared/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

type StepAbilitiesProps = {
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

function assignFromRaw(
  rawValues: number[],
  picks: Record<keyof AbilityScores, number>,
): AbilityScores {
  const result = {} as AbilityScores;
  for (const key of ABILITY_KEYS) {
    result[key] = rawValues[picks[key]] ?? 10;
  }
  return result;
}

const DEFAULT_PICKS = Object.fromEntries(
  ABILITY_KEYS.map((key, index) => [key, index]),
) as Record<keyof AbilityScores, number>;

export function StepAbilities({
  control,
  errors,
  setValue,
}: StepAbilitiesProps) {
  const roll = useRollAbilities();
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
  }, [allowedSlugSet, boostPlus1, boostPlus2, setValue]);

  const boostOptionsLoading =
    !!backgroundSlug && backgroundDetail.isPending && boostOptions.length === 0;

  const previewScores =
    boostPlus2 && boostPlus1 && boostPlus2 !== boostPlus1
      ? previewBackgroundAbilityBoosts(
          abilityScores,
          boostPlus2 as keyof AbilityScores,
          boostPlus1 as keyof AbilityScores,
        )
      : null;

  const isPointBuy = method === "point-buy";
  const hasRawPool = !isPointBuy && rawValues && rawValues.length === 6;

  function applyMethodChange(
    next: CreateCharacterInput["abilityGenerationMethodSlug"],
  ) {
    setValue("abilityGenerationMethodSlug", next);
    setValue("abilityRawValues", undefined);
    if (next === "point-buy") {
      setValue("abilityScores", { ...POINT_BUY_DEFAULT });
    } else {
      setValue("abilityScores", { ...DEFAULT_ABILITY_SCORES });
    }
  }

  function handleGenerate() {
    if (isPointBuy) return;

    roll.mutate(
      { method },
      {
        onSuccess: (result) => {
          setValue("abilityRawValues", result.rawValues ?? []);
          setValue("abilityScores", result.abilityScores);
        },
      },
    );
  }

  function handleRawPick(key: keyof AbilityScores, rawIndex: number) {
    if (!rawValues?.length) return;
    const picks = { ...DEFAULT_PICKS };
    for (const abilityKey of ABILITY_KEYS) {
      const current = abilityScores[abilityKey];
      const idx = rawValues.indexOf(current);
      picks[abilityKey] = idx >= 0 ? idx : 0;
    }
    picks[key] = rawIndex;
    setValue("abilityScores", assignFromRaw(rawValues, picks));
  }

  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="abilityGenerationMethodSlug">
            Método de geração
          </FieldLabel>
          <FieldDescription>
            Conjunto padrão, rolagem 4d6 ou point-buy (27 pontos).
          </FieldDescription>
          <select
            id="abilityGenerationMethodSlug"
            className={cn(
              "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30",
            )}
            value={method}
            onChange={(e) =>
              applyMethodChange(
                e.target
                  .value as CreateCharacterInput["abilityGenerationMethodSlug"],
              )
            }
          >
            <option value="standard-array">
              Conjunto padrão (15, 14, 13, 12, 10, 8)
            </option>
            <option value="roll">Rolagem 4d6 (descarta o menor)</option>
            <option value="point-buy">Point-buy (27 pontos)</option>
          </select>
        </Field>

        {!isPointBuy ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
              disabled={roll.isPending}
            >
              {roll.isPending ? "Gerando…" : "Gerar valores"}
            </Button>
            {hasRawPool ? (
              <p className="text-sm text-muted-foreground">
                Valores gerados: {rawValues.join(", ")} — ordem padrão Força →
                Carisma; ajuste nos selects se quiser.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Clique em gerar para obter os valores da API.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pontos gastos: {pointBuySpent(abilityScores)} / 27 · Restantes:{" "}
            {pointBuyRemaining(abilityScores)}
          </p>
        )}

        {roll.isError ? (
          <p className="text-sm text-destructive" role="alert">
            {roll.error instanceof Error
              ? roll.error.message
              : "Erro ao gerar atributos"}
          </p>
        ) : null}

        <FieldError errors={[errors.abilityScores]} />
      </FieldGroup>

      <div className="grid gap-3 sm:grid-cols-2">
        {ABILITY_KEYS.map((key) => (
          <div key={key} className="rounded-lg border border-border px-3 py-3">
            <p className="text-sm font-medium">{ABILITY_LABELS_PT[key]}</p>

            {isPointBuy ? (
              <Input
                type="number"
                min={POINT_BUY_MIN}
                max={POINT_BUY_MAX}
                className="mt-2"
                value={abilityScores[key]}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setValue("abilityScores", {
                    ...abilityScores,
                    [key]: Number.isFinite(next) ? next : POINT_BUY_MIN,
                  });
                }}
              />
            ) : hasRawPool ? (
              <select
                className={cn(
                  "mt-2 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm",
                  "dark:bg-input/30",
                )}
                value={rawValues.indexOf(abilityScores[key])}
                onChange={(e) => handleRawPick(key, Number(e.target.value))}
              >
                {rawValues.map((value, index) => (
                  <option key={`${key}-${index}`} value={index}>
                    {value}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-2 text-2xl font-semibold">
                {abilityScores[key]}
              </p>
            )}

            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {abilityModifier(abilityScores[key])}
            </p>
          </div>
        ))}
      </div>

      {backgroundSlug && boostOptions.length > 0 ? (
        <FieldGroup key={backgroundSlug}>
          <Field>
            <FieldLabel>Bônus do antecedente (PHB 2024)</FieldLabel>
            <FieldDescription>
              {selectedBackground?.name ?? "Antecedente"} permite +2 e +1 apenas
              em:{" "}
              <span className="font-medium text-foreground">
                {boostOptions.map((o) => o.label).join(", ")}
              </span>
              . A API aplica os bônus sobre os valores base acima.
            </FieldDescription>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <CatalogSelect
              id="background-boost-plus2"
              label="Atributo +2"
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
              label="Atributo +1"
              options={boostOptions.filter((o) => o.value !== boostPlus2Value)}
              isLoading={boostOptionsLoading}
              value={boostPlus1Value}
              onChange={(e) =>
                setValue("backgroundAbilityBoostPlus1Slug", e.target.value)
              }
              error={errors.backgroundAbilityBoostPlus1Slug}
            />
          </div>

          {previewScores ? (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-medium">
                Valores finais (preview)
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                {ABILITY_KEYS.map((key) => (
                  <div key={key}>
                    <span className="text-muted-foreground">
                      {ABILITY_LABELS_PT[key]}:{" "}
                    </span>
                    <span className="font-medium">{previewScores[key]}</span>
                    {previewScores[key] !== abilityScores[key] ? (
                      <span className="ml-1 text-xs text-primary">
                        (base {abilityScores[key]})
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </FieldGroup>
      ) : backgroundSlug && !boostOptionsLoading ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível carregar os atributos permitidos para este
          antecedente.
        </p>
      ) : null}
    </div>
  );
}
