"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useWatch } from "react-hook-form";

import {
  useBackgrounds,
  useBackgroundSkills,
} from "@/features/background-catalog/api/use-backgrounds";
import { buildBackgroundAbilityBoostOptions } from "@/entities/background/lib/background-ability-options";
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
import { useSpecies } from "@/features/species-catalog/api/use-species";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type StepIdentityProps = {
  register: UseFormRegister<CreateCharacterInput>;
  control: Control<CreateCharacterInput>;
  errors: FieldErrors<CreateCharacterInput>;
};

export function StepIdentity({ register, control, errors }: StepIdentityProps) {
  const classes = useClasses();
  const species = useSpecies();
  const backgrounds = useBackgrounds();

  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
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
  const backgroundSkills = useBackgroundSkills(
    backgroundSlug,
    !!backgroundSlug,
  );
  const selectedBackground = backgrounds.data?.data.find(
    (b) => b.slug === backgroundSlug,
  );
  const backgroundAbilityOptions = buildBackgroundAbilityBoostOptions(
    selectedBackground?.abilityOptionSlugs,
    selectedBackground?.abilityOptionNames,
  );

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="name">Nome do personagem</FieldLabel>
        <Input
          id="name"
          autoComplete="off"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError errors={[errors.name]} />
      </Field>

      <CatalogSelect
        id="level"
        label="Nível inicial"
        description="1 para personagem novo; 5+ para entrar em campanha já em andamento."
        options={LEVEL_OPTIONS.map((lv) => ({
          value: String(lv),
          label: `Nível ${lv}`,
        }))}
        error={errors.level}
        {...register("level", { valueAsNumber: true })}
      />

      <CatalogSelect
        id="classSlug"
        label="Classe"
        isLoading={classes.isPending}
        options={(classes.data?.data ?? []).map((c) => ({
          value: c.slug,
          label: c.name,
        }))}
        error={errors.classSlug}
        {...register("classSlug")}
      />

      {needsSubclass ? (
        <CatalogSelect
          id="subclassSlug"
          label="Subclasse"
          description={`Obrigatória a partir do nível ${SUBCLASS_REQUIRED_FROM_LEVEL}.`}
          isLoading={subclasses.isPending}
          options={(subclasses.data?.data ?? []).map((s) => ({
            value: s.slug,
            label: s.name,
          }))}
          error={errors.subclassSlug}
          {...register("subclassSlug")}
        />
      ) : null}

      <CatalogSelect
        id="speciesSlug"
        label="Espécie"
        isLoading={species.isPending}
        options={(species.data?.data ?? []).map((s) => ({
          value: s.slug,
          label: s.name,
        }))}
        error={errors.speciesSlug}
        {...register("speciesSlug")}
      />

      <CatalogSelect
        id="backgroundSlug"
        label="Antecedente"
        isLoading={backgrounds.isPending}
        options={(backgrounds.data?.data ?? []).map((b) => ({
          value: b.slug,
          label: b.name,
        }))}
        error={errors.backgroundSlug}
        {...register("backgroundSlug")}
      />

      {backgroundSlug && backgroundAbilityOptions.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Bônus de atributo ({selectedBackground?.name}):{" "}
          {backgroundAbilityOptions.map((o) => o.label).join(", ")}
        </p>
      ) : null}

      {backgroundSlug && (backgroundSkills.data?.data.length ?? 0) > 0 ? (
        <p className="text-sm text-muted-foreground">
          Perícias do antecedente:{" "}
          {backgroundSkills.data!.data.map((s) => s.name).join(", ")}
        </p>
      ) : null}
    </FieldGroup>
  );
}
