"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { UpdateCharacterPayload } from "@/entities/character/types";
import { useBackgrounds } from "@/features/background-catalog/api/use-backgrounds";
import {
  useClasses,
  useClassSubclasses,
} from "@/features/class-catalog/api/use-classes";
import {
  identityStepSchema,
  SUBCLASS_REQUIRED_FROM_LEVEL,
} from "@/features/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character-sheet/ui/edit/edit-form-shell";
import { useAlignments } from "@/features/reference-catalog/api/use-reference";
import { useSpecies } from "@/features/species-catalog/api/use-species";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type IdentityEditInput = z.infer<typeof identityStepSchema>;

export function EditIdentityForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const classes = useClasses();
  const species = useSpecies();
  const backgrounds = useBackgrounds();
  const alignments = useAlignments();
  const [alignmentSlug, setAlignmentSlug] = useState(
    character.alignmentSlug ?? "",
  );

  const form = useForm<IdentityEditInput>({
    resolver: zodResolver(identityStepSchema),
    defaultValues: {
      name: character.name,
      level: character.level,
      classSlug: character.classSlug,
      speciesSlug: character.speciesSlug,
      backgroundSlug: character.backgroundSlug,
      subclassSlug: character.subclassSlug ?? "",
    },
  });

  const level = useWatch({
    control: form.control,
    name: "level",
    defaultValue: character.level,
  });
  const classSlug = useWatch({
    control: form.control,
    name: "classSlug",
    defaultValue: character.classSlug,
  });
  const watchedIdentity = useWatch({ control: form.control });
  const needsSubclass = level >= SUBCLASS_REQUIRED_FROM_LEVEL;
  const subclasses = useClassSubclasses(
    classSlug,
    needsSubclass && !!classSlug,
  );

  const identityChanged =
    watchedIdentity.classSlug !== character.classSlug ||
    watchedIdentity.speciesSlug !== character.speciesSlug ||
    watchedIdentity.subclassSlug !== (character.subclassSlug ?? "") ||
    watchedIdentity.backgroundSlug !== character.backgroundSlug;

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError}
      onCancel={onCancel}
      onSubmit={form.handleSubmit((values) => {
        const payload: UpdateCharacterPayload = {
          name: values.name,
          level: values.level,
          classSlug: values.classSlug,
          speciesSlug: values.speciesSlug,
          backgroundSlug: values.backgroundSlug,
        };
        if (needsSubclass && values.subclassSlug) {
          payload.subclassSlug = values.subclassSlug;
        }
        if (alignmentSlug) {
          payload.alignmentSlug = alignmentSlug;
        }
        return submit(payload);
      })}
    >
      {identityChanged ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          Trocar classe, espécie, subclasse ou antecedente pode invalidar
          escolhas já feitas — a API pode limpar opções incompatíveis.
        </p>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="edit-name">Nome</FieldLabel>
          <Input id="edit-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <CatalogSelect
          id="edit-level"
          label="Nível"
          options={Array.from({ length: 20 }, (_, i) => ({
            value: String(i + 1),
            label: `Nível ${i + 1}`,
          }))}
          error={form.formState.errors.level}
          {...form.register("level", { valueAsNumber: true })}
        />

        <CatalogSelect
          id="edit-class"
          label="Classe"
          isLoading={classes.isPending}
          options={(classes.data?.data ?? []).map((c) => ({
            value: c.slug,
            label: c.name,
          }))}
          error={form.formState.errors.classSlug}
          {...form.register("classSlug")}
        />

        {needsSubclass ? (
          <CatalogSelect
            id="edit-subclass"
            label="Subclasse"
            isLoading={subclasses.isPending}
            options={(subclasses.data?.data ?? []).map((s) => ({
              value: s.slug,
              label: s.name,
            }))}
            error={form.formState.errors.subclassSlug}
            {...form.register("subclassSlug")}
          />
        ) : null}

        <CatalogSelect
          id="edit-species"
          label="Espécie"
          isLoading={species.isPending}
          options={(species.data?.data ?? []).map((s) => ({
            value: s.slug,
            label: s.name,
          }))}
          error={form.formState.errors.speciesSlug}
          {...form.register("speciesSlug")}
        />

        <CatalogSelect
          id="edit-background"
          label="Antecedente"
          isLoading={backgrounds.isPending}
          options={(backgrounds.data?.data ?? []).map((b) => ({
            value: b.slug,
            label: b.name,
          }))}
          error={form.formState.errors.backgroundSlug}
          {...form.register("backgroundSlug")}
        />

        <CatalogSelect
          id="edit-alignment"
          label="Alinhamento"
          isLoading={alignments.isPending}
          options={(alignments.data?.data ?? []).map((a) => ({
            value: a.slug,
            label: a.name,
          }))}
          value={alignmentSlug}
          onChange={(e) => setAlignmentSlug(e.target.value)}
        />
      </FieldGroup>
    </EditFormShell>
  );
}
