"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useBackgrounds } from "@/features/background-catalog/api/use-backgrounds";
import { useClasses } from "@/features/class-catalog/api/use-classes";
import { useCreateCharacter } from "@/features/create-character/api/use-create-character";
import {
  createCharacterSchema,
  type CreateCharacterInput,
} from "@/features/create-character/model/create-character.schema";
import { useSpecies } from "@/features/species-catalog/api/use-species";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

function CatalogSelect({
  id,
  label,
  options,
  isLoading,
  error,
  ...props
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  isLoading?: boolean;
  error?: { message?: string };
} & React.ComponentProps<"select">) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        disabled={isLoading}
        aria-invalid={!!error}
        className={cn(
          "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:opacity-50 dark:bg-input/30",
        )}
        {...props}
      >
        <option value="">{isLoading ? "Carregando…" : "Selecione"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError errors={[error]} />
    </Field>
  );
}

export function CreateCharacterForm() {
  const router = useRouter();
  const classes = useClasses();
  const species = useSpecies();
  const backgrounds = useBackgrounds();
  const create = useCreateCharacter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCharacterInput>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: "",
      classSlug: "",
      speciesSlug: "",
      backgroundSlug: "",
    },
  });

  const catalogLoading =
    classes.isPending || species.isPending || backgrounds.isPending;

  return (
    <form
      className="flex max-w-md flex-col gap-5"
      onSubmit={handleSubmit((values) => create.mutate(values))}
    >
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
      </FieldGroup>

      {create.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {create.error instanceof Error
            ? create.error.message
            : "Erro ao criar ficha"}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || create.isPending || catalogLoading}
        >
          {create.isPending ? "Criando…" : "Criar ficha"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/characters")}
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Atributos, HP e perícias são calculados pela dnd-api com defaults do
        PHB.
      </p>
    </form>
  );
}
