"use client";

import { useMemo } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { useBackgrounds } from "@/features/background-catalog/api/use-backgrounds";
import {
  useClasses,
  useClassSubclasses,
} from "@/features/class-catalog/api/use-classes";
import {
  LEVEL_OPTIONS,
  SUBCLASS_REQUIRED_FROM_LEVEL,
  type CreateCharacterInput,
} from "@/features/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { OriginPreview } from "@/features/create-character/ui/origin-preview";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { useAlignments } from "@/features/reference-catalog/api/use-reference";
import { useSpecies } from "@/features/species-catalog/api/use-species";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type StepIdentityProps = {
  register: UseFormRegister<CreateCharacterInput>;
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
};

function sortByLabel<T extends { label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.label.localeCompare(b.label, "pt"));
}

export function StepIdentity({ register, control, errors }: StepIdentityProps) {
  const classes = useClasses();
  const species = useSpecies();
  const backgrounds = useBackgrounds();
  const alignments = useAlignments();

  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const speciesSlug = useWatch({
    control,
    name: "speciesSlug",
    defaultValue: "",
  });
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
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

  const speciesOptions = useMemo(
    () =>
      sortByLabel(
        (species.data?.data ?? []).map((s) => ({
          value: s.slug,
          label: s.name,
        })),
      ),
    [species.data?.data],
  );

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
            <CatalogSelect
              id="level"
              label="Nível"
              options={LEVEL_OPTIONS.map((lv) => ({
                value: String(lv),
                label: String(lv),
              }))}
              error={errors.level}
              {...register("level", { valueAsNumber: true })}
            />

            <CatalogSelect
              id="classSlug"
              label="Classe"
              isLoading={classes.isPending}
              options={classOptions}
              error={errors.classSlug}
              {...register("classSlug")}
            />

            {needsSubclass ? (
              <CatalogSelect
                id="subclassSlug"
                label="Subclasse"
                isLoading={subclasses.isPending}
                disabled={!classSlug}
                options={subclassOptions}
                error={errors.subclassSlug}
                {...register("subclassSlug")}
              />
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <CatalogSelect
              id="speciesSlug"
              label="Espécie"
              isLoading={species.isPending}
              options={speciesOptions}
              error={errors.speciesSlug}
              {...register("speciesSlug")}
            />

            <CatalogSelect
              id="backgroundSlug"
              label="Antecedente"
              isLoading={backgrounds.isPending}
              options={backgroundOptions}
              error={errors.backgroundSlug}
              {...register("backgroundSlug")}
            />
          </div>

          <CatalogSelect
            id="alignmentSlug"
            label="Alinhamento"
            isLoading={alignments.isPending}
            options={[
              { value: "", label: "Não definido" },
              ...alignmentOptions,
            ]}
            {...register("alignmentSlug")}
          />
        </WizardFormSection>
      </div>

      <aside className="lg:sticky lg:top-4">
        <OriginPreview
          classSlug={classSlug || undefined}
          speciesSlug={speciesSlug || undefined}
          backgroundSlug={backgroundSlug || undefined}
          level={level}
          showPlaceholder={!classSlug && !speciesSlug && !backgroundSlug}
        />
      </aside>
    </div>
  );
}
