"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { AbilityScores } from "@/entities/character/types";
import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character";
import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
  BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
  stripBackgroundAbilityBoosts,
  type BackgroundBoostMode,
} from "@/entities/character/lib/background-boost";
import {
  applyBackgroundBoostModeChange,
  computeBackgroundBoostPreview,
  createBackgroundAbilityBoostValue,
  formatBoostOptionLabels,
  setBackgroundBoostPlus1x3Slug,
  validateBackgroundAbilityBoost,
} from "@/features/background-catalog/lib/background-ability-boost-form";
import { useBackgroundAbilityBoostOptions } from "@/features/background-catalog/lib/use-background-ability-boost-options";
import { BackgroundAbilityBoostFields } from "@/features/background-catalog/ui/background-ability-boost-fields";
import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character-sheet/ui/edit/edit-form-shell";
import { ABILITY_KEYS } from "@/features/create-character/model/create-character.schema";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

const abilitiesEditSchema = z.object({
  forca: z.number().int().min(1).max(30),
  destreza: z.number().int().min(1).max(30),
  constituicao: z.number().int().min(1).max(30),
  inteligencia: z.number().int().min(1).max(30),
  sabedoria: z.number().int().min(1).max(30),
  carisma: z.number().int().min(1).max(30),
  backgroundAbilityBoostMode: z.enum(["plus2plus1", "plus1x3"]),
  backgroundAbilityBoostPlus2Slug: z.string().optional(),
  backgroundAbilityBoostPlus1Slug: z.string().optional(),
  backgroundAbilityBoostPlus1Slugs: z.array(z.string()).length(3).optional(),
});

type AbilitiesEditInput = z.infer<typeof abilitiesEditSchema>;

function toAbilityScores(values: AbilitiesEditInput): AbilityScores {
  return {
    forca: values.forca,
    destreza: values.destreza,
    constituicao: values.constituicao,
    inteligencia: values.inteligencia,
    sabedoria: values.sabedoria,
    carisma: values.carisma,
  };
}

export function EditAbilitiesForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const [boostError, setBoostError] = useState<string | null>(null);

  const {
    allowedSlugs,
    boostOptions,
    isLoading: boostOptionsLoading,
    backgroundName,
  } = useBackgroundAbilityBoostOptions(character.backgroundSlug);

  const baseScores = useMemo(
    () =>
      stripBackgroundAbilityBoosts(character.abilityScores, {
        mode: character.backgroundAbilityBoostMode,
        plus2Slug: character.backgroundAbilityBoostPlus2Slug,
        plus1Slug: character.backgroundAbilityBoostPlus1Slug,
        plus1Slugs: character.backgroundAbilityBoostPlus1Slugs,
      }),
    [character],
  );

  const form = useForm<AbilitiesEditInput>({
    resolver: zodResolver(abilitiesEditSchema),
    defaultValues: {
      ...baseScores,
      backgroundAbilityBoostMode:
        character.backgroundAbilityBoostMode ?? BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
      backgroundAbilityBoostPlus2Slug:
        character.backgroundAbilityBoostPlus2Slug ?? "",
      backgroundAbilityBoostPlus1Slug:
        character.backgroundAbilityBoostPlus1Slug ?? "",
      backgroundAbilityBoostPlus1Slugs:
        character.backgroundAbilityBoostPlus1Slugs?.length === 3
          ? character.backgroundAbilityBoostPlus1Slugs
          : ["", "", ""],
    },
  });

  const scores = useWatch({ control: form.control }) as AbilitiesEditInput;
  const boostValue = createBackgroundAbilityBoostValue({
    mode: scores.backgroundAbilityBoostMode as BackgroundBoostMode,
    plus2Slug: scores.backgroundAbilityBoostPlus2Slug,
    plus1Slug: scores.backgroundAbilityBoostPlus1Slug,
    plus1Slugs: scores.backgroundAbilityBoostPlus1Slugs,
  });
  const hasBackgroundBoosts = boostOptions.length > 0;

  const previewScores = hasBackgroundBoosts
    ? computeBackgroundBoostPreview(
        toAbilityScores(scores),
        boostValue,
        allowedSlugs,
      )
    : null;

  function applyBoostMode(next: BackgroundBoostMode) {
    const nextValue = applyBackgroundBoostModeChange(
      boostValue,
      next,
      allowedSlugs,
    );
    form.setValue("backgroundAbilityBoostMode", nextValue.mode);
    form.setValue("backgroundAbilityBoostPlus2Slug", nextValue.plus2Slug);
    form.setValue("backgroundAbilityBoostPlus1Slug", nextValue.plus1Slug);
    form.setValue("backgroundAbilityBoostPlus1Slugs", nextValue.plus1Slugs);
  }

  function setPlus1x3Slug(index: number, value: string) {
    form.setValue(
      "backgroundAbilityBoostPlus1Slugs",
      setBackgroundBoostPlus1x3Slug(boostValue.plus1Slugs, index, value),
    );
  }

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={boostError ?? formError}
      onCancel={onCancel}
      onSubmit={form.handleSubmit((values) => {
        setBoostError(null);
        const base = toAbilityScores(values);
        const mode = values.backgroundAbilityBoostMode ?? "plus2plus1";

        if (hasBackgroundBoosts) {
          const validationError = validateBackgroundAbilityBoost(
            createBackgroundAbilityBoostValue({
              mode: mode as BackgroundBoostMode,
              plus2Slug: values.backgroundAbilityBoostPlus2Slug,
              plus1Slug: values.backgroundAbilityBoostPlus1Slug,
              plus1Slugs: values.backgroundAbilityBoostPlus1Slugs,
            }),
          );
          if (validationError) {
            setBoostError(validationError);
            return;
          }

          if (mode === BACKGROUND_BOOST_MODE_PLUS1X3) {
            const slugs = (values.backgroundAbilityBoostPlus1Slugs ?? [])
              .map((slug) => slug?.trim())
              .filter((slug): slug is string => !!slug);
            return submit({
              abilityScores: base,
              backgroundAbilityBoostMode: mode,
              backgroundAbilityBoostPlus1Slugs: slugs,
            });
          }

          const plus2 = values.backgroundAbilityBoostPlus2Slug?.trim();
          const plus1 = values.backgroundAbilityBoostPlus1Slug?.trim();
          return submit({
            abilityScores: base,
            backgroundAbilityBoostMode: mode,
            backgroundAbilityBoostPlus2Slug: plus2,
            backgroundAbilityBoostPlus1Slug: plus1,
          });
        }

        return submit({ abilityScores: base });
      })}
    >
      {hasBackgroundBoosts ? (
        <p className="text-sm text-muted-foreground">
          Edite os valores{" "}
          <span className="font-medium text-foreground">base</span> (antes dos
          bônus do antecedente). A API recalcula os finais ao salvar.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {ABILITY_KEYS.map((key) => (
          <div key={key} className="rounded-lg border border-border px-3 py-3">
            <p className="text-sm font-medium">{ABILITY_LABELS_PT[key]}</p>
            <Input
              type="number"
              min={1}
              max={30}
              className="mt-2"
              {...form.register(key, { valueAsNumber: true })}
            />
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {abilityModifier(Number(scores[key]) || 10)}
              {previewScores ? (
                <span className="ml-2 text-primary">
                  → {abilityModifier(previewScores[key])} final
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      {hasBackgroundBoosts ? (
        <FieldGroup>
          <Field>
            <FieldLabel>Bônus do antecedente (PHB 2024)</FieldLabel>
            <FieldDescription>
              {backgroundName ?? "Antecedente"} permite bônus apenas em:{" "}
              <span className="font-medium text-foreground">
                {formatBoostOptionLabels(boostOptions)}
              </span>
              .
            </FieldDescription>
          </Field>

          <BackgroundAbilityBoostFields
            idPrefix="edit-background"
            boostOptions={boostOptions}
            allowedSlugs={allowedSlugs}
            isLoading={boostOptionsLoading}
            mode={boostValue.mode}
            plus2Slug={boostValue.plus2Slug}
            plus1Slug={boostValue.plus1Slug}
            plus1Slugs={boostValue.plus1Slugs}
            onModeChange={applyBoostMode}
            onPlus2Change={(slug) =>
              form.setValue("backgroundAbilityBoostPlus2Slug", slug)
            }
            onPlus1Change={(slug) =>
              form.setValue("backgroundAbilityBoostPlus1Slug", slug)
            }
            onPlus1x3Change={setPlus1x3Slug}
            errors={{
              plus2Slug: form.formState.errors.backgroundAbilityBoostPlus2Slug,
              plus1Slug: form.formState.errors.backgroundAbilityBoostPlus1Slug,
            }}
            plus2Label="Atributo +2"
            plus1Label="Atributo +1"
            gridGap="3"
            previewScores={previewScores}
            previewLayout="grid"
          />
        </FieldGroup>
      ) : null}
    </EditFormShell>
  );
}
