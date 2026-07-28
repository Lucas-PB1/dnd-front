"use client";

import { useEffect, useMemo } from "react";
import { DEFAULT_ABILITY_SCORES } from "@/features/create-character/lib/abilities/point-buy";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  applyBackgroundBoostModeChange,
  computeBackgroundBoostPreview,
  createBackgroundAbilityBoostValue,
  sanitizeBackgroundBoostSlugs,
  setBackgroundBoostPlus1x3Slug,
} from "@/features/background-catalog/lib/background-ability-boost-form";
import { useBackgroundAbilityBoostOptions } from "@/features/background-catalog/lib/use-background-ability-boost-options";
import { BackgroundAbilityBoostFields } from "@/features/background-catalog/ui/background-ability-boost-fields";
import { WizardFormSection } from "@/features/create-character/ui/wizard/wizard-form-section";
import type { BackgroundBoostMode } from "@/entities/character/lib/background-boost";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

type WizardBackgroundBoostSectionProps = {
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function WizardBackgroundBoostSection({
  control,
  errors,
  setValue,
}: WizardBackgroundBoostSectionProps) {
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

  const {
    allowedSlugs,
    boostOptions,
    isLoading: boostOptionsLoading,
    backgroundName,
  } = useBackgroundAbilityBoostOptions(backgroundSlug);

  const boostValue = useMemo(
    () =>
      createBackgroundAbilityBoostValue({
        mode: boostMode as BackgroundBoostMode,
        plus2Slug: boostPlus2,
        plus1Slug: boostPlus1,
        plus1Slugs: boostPlus1Slugs,
      }),
    [boostMode, boostPlus1, boostPlus1Slugs, boostPlus2],
  );

  useEffect(() => {
    const sanitized = sanitizeBackgroundBoostSlugs(boostValue, allowedSlugs);
    if (sanitized === boostValue) return;
    setValue("backgroundAbilityBoostPlus2Slug", sanitized.plus2Slug);
    setValue("backgroundAbilityBoostPlus1Slug", sanitized.plus1Slug);
    setValue("backgroundAbilityBoostPlus1Slugs", sanitized.plus1Slugs);
  }, [allowedSlugs, boostValue, setValue]);

  const previewScores = computeBackgroundBoostPreview(
    abilityScores,
    boostValue,
    allowedSlugs,
  );

  function applyBoostMode(next: BackgroundBoostMode) {
    const nextValue = applyBackgroundBoostModeChange(
      boostValue,
      next,
      allowedSlugs,
    );
    setValue("backgroundAbilityBoostMode", nextValue.mode);
    setValue("backgroundAbilityBoostPlus2Slug", nextValue.plus2Slug);
    setValue("backgroundAbilityBoostPlus1Slug", nextValue.plus1Slug);
    setValue("backgroundAbilityBoostPlus1Slugs", nextValue.plus1Slugs);
  }

  function setPlus1x3Slug(index: number, value: string) {
    setValue(
      "backgroundAbilityBoostPlus1Slugs",
      setBackgroundBoostPlus1x3Slug(boostValue.plus1Slugs, index, value),
    );
  }

  if (!backgroundSlug) return null;

  if (boostOptions.length > 0) {
    return (
      <WizardFormSection
        key={backgroundSlug}
        title={`Bônus · ${backgroundName ?? "Antecedente"}`}
        compact
      >
        <BackgroundAbilityBoostFields
          idPrefix="background"
          boostOptions={boostOptions}
          allowedSlugs={allowedSlugs}
          isLoading={boostOptionsLoading}
          mode={boostValue.mode}
          plus2Slug={boostValue.plus2Slug}
          plus1Slug={boostValue.plus1Slug}
          plus1Slugs={boostValue.plus1Slugs}
          onModeChange={applyBoostMode}
          onPlus2Change={(slug) =>
            setValue("backgroundAbilityBoostPlus2Slug", slug)
          }
          onPlus1Change={(slug) =>
            setValue("backgroundAbilityBoostPlus1Slug", slug)
          }
          onPlus1x3Change={setPlus1x3Slug}
          errors={{
            plus2Slug: errors.backgroundAbilityBoostPlus2Slug,
            plus1Slug: errors.backgroundAbilityBoostPlus1Slug,
            plus1Slugs: errors.backgroundAbilityBoostPlus1Slugs,
          }}
          previewScores={previewScores}
          baseScores={abilityScores}
          previewLayout="inline"
        />
      </WizardFormSection>
    );
  }

  if (!boostOptionsLoading) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Não foi possível carregar os atributos deste antecedente.
      </p>
    );
  }

  return null;
}
