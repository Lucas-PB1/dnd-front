"use client";

import { useMemo } from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

import { useBackgrounds } from "@/features/catalog/background-catalog/api/use-backgrounds";
import {
  useClasses,
  useClassSubclasses,
} from "@/features/catalog/class-catalog/api/use-classes";
import { buildSpeciesSelectOptions } from "@/features/character/create-character/lib/species/build-species-select-options";
import {
  LEVEL_OPTIONS,
  SUBCLASS_REQUIRED_FROM_LEVEL,
  type CreateCharacterInput,
} from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { OriginPreview } from "@/features/character/create-character/ui/origin-preview";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { useAlignments } from "@/features/catalog/reference-catalog/api/use-reference";
import { useHeritages } from "@/features/catalog/heritage-catalog/api/use-heritages";
import { useSpecies } from "@/features/catalog/species-catalog/api/use-species";
import { formatHeritageVariantLabel } from "@/entities/heritage/origin-label";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type StepIdentityProps = {
  register: UseFormRegister<CreateCharacterInput>;
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

function sortByLabel<T extends { label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.label.localeCompare(b.label, "pt"));
}

function isHeritageOriginSlug(slug: string): boolean {
  return slug.startsWith("gh-");
}

export function StepIdentity({
  register,
  control,
  errors,
  setValue,
}: StepIdentityProps) {
  const classes = useClasses();
  const species = useSpecies();
  const heritages = useHeritages();
  const backgrounds = useBackgrounds();
  const alignments = useAlignments();

  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const speciesSlug = useWatch({
    control,
    name: "speciesSlug",
    defaultValue: "",
  });
  const heritageSlug = useWatch({
    control,
    name: "heritageSlug",
    defaultValue: "",
  });
  const originSlug = heritageSlug || speciesSlug;
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });

  const subclassSlug = useWatch({
    control,
    name: "subclassSlug",
    defaultValue: "",
  });

  const needsSubclass = level >= SUBCLASS_REQUIRED_FROM_LEVEL;
  const subclasses = useClassSubclasses(
    classSlug,
    needsSubclass && !!classSlug,
  );

  const classOptions = useMemo(
    () =>
      sortByLabel(
        (classes.data?.data ?? []).map((c) => ({
          value: c.slug,
          label: c.name,
        })),
      ),
    [classes.data?.data],
  );

  const originOptions = useMemo(() => {
    const phb = buildSpeciesSelectOptions(species.data?.data ?? []);
    const gh = sortByLabel(
      (heritages.data ?? []).map((heritage) => ({
        value: heritage.slug,
        label: formatHeritageVariantLabel(heritage.name),
      })),
    );
    return sortByLabel([...phb, ...gh]);
  }, [heritages.data, species.data?.data]);

  const backgroundOptions = useMemo(
    () =>
      sortByLabel(
        (backgrounds.data?.data ?? []).map((b) => ({
          value: b.slug,
          label: b.name,
        })),
      ),
    [backgrounds.data?.data],
  );

  const subclassOptions = useMemo(
    () =>
      sortByLabel(
        (subclasses.data?.data ?? []).map((s) => ({
          value: s.slug,
          label: s.name,
        })),
      ),
    [subclasses.data?.data],
  );

  const alignmentOptions = useMemo(
    () =>
      sortByLabel(
        (alignments.data?.data ?? []).map((alignment) => ({
          value: alignment.slug,
          label: alignment.name,
        })),
      ),
    [alignments.data?.data],
  );

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] lg:items-start lg:gap-6">
      <div className="space-y-3">
        <WizardFormSection title="Identidade" compact>
          <Field>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input
              id="name"
              autoComplete="off"
              placeholder="Ex.: Lyra Nocturna"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <div
            className={
              needsSubclass
                ? "grid gap-4 sm:grid-cols-[minmax(6.5rem,8rem)_minmax(0,1fr)_minmax(0,1fr)] sm:items-start"
                : "grid gap-4 sm:grid-cols-[minmax(7.5rem,9rem)_minmax(0,1fr)] sm:items-start"
            }
          >
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <CatalogSelect
                  id="level"
                  label="Nível"
                  name={field.name}
                  options={LEVEL_OPTIONS.map((lv) => ({
                    value: String(lv),
                    label: String(lv),
                  }))}
                  value={String(field.value ?? "")}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={errors.level}
                />
              )}
            />

            <Controller
              control={control}
              name="classSlug"
              render={({ field }) => (
                <CatalogSelect
                  id="classSlug"
                  label="Classe"
                  name={field.name}
                  isLoading={classes.isPending}
                  options={classOptions}
                  value={field.value ?? ""}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={errors.classSlug}
                />
              )}
            />

            {needsSubclass ? (
              <Controller
                control={control}
                name="subclassSlug"
                render={({ field }) => (
                  <CatalogSelect
                    id="subclassSlug"
                    label="Subclasse"
                    name={field.name}
                    isLoading={subclasses.isPending}
                    disabled={!classSlug}
                    options={subclassOptions}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.subclassSlug}
                  />
                )}
              />
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <Controller
              control={control}
              name="speciesSlug"
              render={({ field }) => (
                <CatalogSelect
                  id="originSlug"
                  label="Espécie / variante"
                  name={field.name}
                  isLoading={species.isPending || heritages.isPending}
                  options={originOptions}
                  value={originSlug ?? ""}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    const slug = event.target.value;
                    if (isHeritageOriginSlug(slug)) {
                      setValue("heritageSlug", slug, { shouldDirty: true });
                      setValue("speciesSlug", "", { shouldDirty: true });
                      setValue("speciesChoices", [], { shouldDirty: true });
                    } else {
                      setValue("speciesSlug", slug, { shouldDirty: true });
                      setValue("heritageSlug", "", { shouldDirty: true });
                      setValue("heritageChoices", [], { shouldDirty: true });
                    }
                  }}
                  error={errors.speciesSlug ?? errors.heritageSlug}
                />
              )}
            />

            <Controller
              control={control}
              name="backgroundSlug"
              render={({ field }) => (
                <CatalogSelect
                  id="backgroundSlug"
                  label="Antecedente"
                  name={field.name}
                  isLoading={backgrounds.isPending}
                  options={backgroundOptions}
                  value={field.value ?? ""}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={errors.backgroundSlug}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="alignmentSlug"
            render={({ field }) => (
              <CatalogSelect
                id="alignmentSlug"
                label="Alinhamento"
                name={field.name}
                isLoading={alignments.isPending}
                options={[
                  { value: "", label: "Não definido" },
                  ...alignmentOptions,
                ]}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </WizardFormSection>
      </div>

      <aside className="lg:sticky lg:top-4">
        <OriginPreview
          classSlug={classSlug || undefined}
          subclassSlug={
            needsSubclass && subclassSlug ? subclassSlug : undefined
          }
          speciesSlug={speciesSlug || undefined}
          heritageSlug={heritageSlug || undefined}
          backgroundSlug={backgroundSlug || undefined}
          level={level}
          showPlaceholder={!classSlug && !originSlug && !backgroundSlug}
        />
      </aside>
    </div>
  );
}
