"use client";

import {
  isBackgroundAbilityBoostAllowed,
  type BackgroundAbilityBoostOption,
} from "@/entities/background/lib/background-ability-options";
import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
  BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
  type BackgroundBoostMode,
} from "@/entities/character/lib/background-boost";
import {
  ABILITY_KEYS,
  ABILITY_LABELS_PT,
  type AbilityScores,
} from "@/entities/character/types";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { Field, FieldLabel } from "@/shared/ui/field";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";
import type { FieldError } from "react-hook-form";

type BackgroundAbilityBoostFieldsProps = {
  idPrefix: string;
  boostOptions: BackgroundAbilityBoostOption[];
  allowedSlugs: string[];
  isLoading?: boolean;
  mode: BackgroundBoostMode;
  plus2Slug: string;
  plus1Slug: string;
  plus1Slugs: string[];
  onModeChange: (mode: BackgroundBoostMode) => void;
  onPlus2Change: (slug: string) => void;
  onPlus1Change: (slug: string) => void;
  onPlus1x3Change: (index: number, slug: string) => void;
  errors?: {
    plus2Slug?: FieldError;
    plus1Slug?: FieldError;
    plus1Slugs?: FieldError;
  };
  plus2Label?: string;
  plus1Label?: string;
  gridGap?: "3" | "4";
  previewScores?: AbilityScores | null;
  baseScores?: AbilityScores;
  previewLayout?: "inline" | "grid" | "none";
};

export function BackgroundAbilityBoostFields({
  idPrefix,
  boostOptions,
  allowedSlugs,
  isLoading = false,
  mode,
  plus2Slug,
  plus1Slug,
  plus1Slugs,
  onModeChange,
  onPlus2Change,
  onPlus1Change,
  onPlus1x3Change,
  errors,
  plus2Label = "+2",
  plus1Label = "+1",
  gridGap = "4",
  previewScores = null,
  baseScores,
  previewLayout = "inline",
}: BackgroundAbilityBoostFieldsProps) {
  const plus2Value = isBackgroundAbilityBoostAllowed(plus2Slug, allowedSlugs)
    ? plus2Slug
    : "";
  const plus1Value = isBackgroundAbilityBoostAllowed(plus1Slug, allowedSlugs)
    ? plus1Slug
    : "";

  const gridGapClass = gridGap === "3" ? "gap-3" : "gap-4";

  return (
    <>
      <Field className="max-w-sm">
        <FieldLabel htmlFor={`${idPrefix}-boost-mode`}>Distribuição</FieldLabel>
        <select
          id={`${idPrefix}-boost-mode`}
          className={nativeSelectClassName}
          value={mode}
          onChange={(e) =>
            onModeChange(e.target.value as BackgroundBoostMode)
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

      {mode === BACKGROUND_BOOST_MODE_PLUS1X3 ? (
        <div className={cn("grid sm:grid-cols-3", gridGapClass)}>
          {[0, 1, 2].map((index) => {
            const selected = plus1Slugs[index] ?? "";
            const taken = new Set(
              plus1Slugs.filter((slug, slugIndex) => slugIndex !== index && !!slug),
            );
            return (
              <CatalogSelect
                key={`${idPrefix}-plus1x3-${index}`}
                id={`${idPrefix}-boost-plus1-${index}`}
                label={`+1 (${index + 1})`}
                options={boostOptions.filter(
                  (option) =>
                    option.value === selected || !taken.has(option.value),
                )}
                isLoading={isLoading}
                value={
                  isBackgroundAbilityBoostAllowed(selected, allowedSlugs)
                    ? selected
                    : ""
                }
                onChange={(e) => onPlus1x3Change(index, e.target.value)}
                error={index === 0 ? errors?.plus1Slugs : undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className={cn("grid sm:grid-cols-2", gridGapClass)}>
          <CatalogSelect
            id={`${idPrefix}-boost-plus2`}
            label={plus2Label}
            options={boostOptions}
            isLoading={isLoading}
            value={plus2Value}
            onChange={(e) => onPlus2Change(e.target.value)}
            error={errors?.plus2Slug}
          />
          <CatalogSelect
            id={`${idPrefix}-boost-plus1`}
            label={plus1Label}
            options={boostOptions.filter((option) => option.value !== plus2Value)}
            isLoading={isLoading}
            value={plus1Value}
            onChange={(e) => onPlus1Change(e.target.value)}
            error={errors?.plus1Slug}
          />
        </div>
      )}

      {previewScores && previewLayout === "inline" ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {ABILITY_KEYS.map((key) => (
            <span key={key}>
              <span className="text-muted-foreground">
                {ABILITY_LABELS_PT[key]}{" "}
              </span>
              <span className="font-medium tabular-nums">
                {previewScores[key]}
              </span>
              {baseScores && previewScores[key] !== baseScores[key] ? (
                <span className="text-primary">
                  {" "}
                  (+{previewScores[key] - baseScores[key]})
                </span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      {previewScores && previewLayout === "grid" ? (
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-sm font-medium">Valores finais (preview)</p>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {ABILITY_KEYS.map((key) => (
              <div key={key}>
                <span className="text-muted-foreground">
                  {ABILITY_LABELS_PT[key]}:{" "}
                </span>
                <span className="font-medium">{previewScores[key]}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
