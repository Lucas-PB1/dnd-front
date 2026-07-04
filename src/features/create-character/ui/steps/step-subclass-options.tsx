"use client";

import { useEffect } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { SubclassOption } from "@/entities/character/sheet-types";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { useSubclassOptions } from "@/features/class-catalog/api/use-classes";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";

type StepSubclassOptionsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepSubclassOptions({
  control,
  setValue,
  error,
}: StepSubclassOptionsProps) {
  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const subclassSlug = useWatch({
    control,
    name: "subclassSlug",
    defaultValue: "",
  });
  const subclassOptions = useWatch({
    control,
    name: "subclassOptions",
    defaultValue: [],
  });

  const enabled = isSubclassRequired(level) && !!subclassSlug;
  const optionsQuery = useSubclassOptions(subclassSlug ?? "", level, enabled);

  useEffect(() => {
    if (!enabled) {
      setValue("subclassOptions", []);
    }
  }, [enabled, setValue]);

  function setOption(optionKey: string, valueId: string) {
    const next: SubclassOption[] = subclassOptions.filter(
      (o) => o.optionKey !== optionKey,
    );
    if (valueId) {
      next.push({ optionKey, valueId });
    }
    setValue("subclassOptions", next);
  }

  if (!enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Subclasse não aplicável neste nível — nenhuma opção necessária.
      </p>
    );
  }

  if (!subclassSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Volte à identidade e escolha uma subclasse.
      </p>
    );
  }

  if (optionsQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando opções…</p>;
  }

  const groups = optionsQuery.data?.data ?? [];

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        A subclasse escolhida não tem opções selecionáveis neste nível.
      </p>
    );
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Opções de subclasse</FieldLabel>
        <FieldDescription>
          Features com escolha desbloqueadas até o nível {level}.
        </FieldDescription>
        <FieldError errors={error ? [{ message: error }] : []} />
      </Field>

      {groups.map((group) => {
        const selected = subclassOptions.find(
          (o) => o.optionKey === group.optionKey,
        )?.valueId;

        return (
          <CatalogSelect
            key={group.optionKey}
            id={`subclass-opt-${group.optionKey}`}
            label={group.label}
            description={`Desbloqueia no nível ${group.unlockLevel}`}
            options={group.values.map((v) => ({
              value: v.valueId,
              label: v.label,
            }))}
            value={selected ?? ""}
            onChange={(e) => setOption(group.optionKey, e.target.value)}
          />
        );
      })}
    </FieldGroup>
  );
}
