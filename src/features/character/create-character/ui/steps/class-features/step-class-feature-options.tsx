"use client";

import { useEffect, useRef } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { ClassOption } from "@/entities/character/sheet-types";
import { useClassFeatureOptions } from "@/features/catalog/class-catalog/api/use-classes";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import {
  ChoicePreviewPanel,
  truncateChoiceHint,
} from "@/features/character/create-character/ui/choice-preview-panel";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { FieldError } from "@/shared/ui/field";

type StepClassFeatureOptionsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepClassFeatureOptions({
  control,
  setValue,
  error,
}: StepClassFeatureOptionsProps) {
  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const classOptions = useWatch({ control, name: "classOptions", defaultValue: [] });
  const enabled = !!classSlug;
  const optionsQuery = useClassFeatureOptions(classSlug, level, enabled);
  const groups = optionsQuery.data?.data ?? [];
  const prevGroupKeysRef = useRef<string[]>([]);

  useEffect(() => {
    const currentKeys = groups.map((group) => group.optionKey);
    const removed = prevGroupKeysRef.current.filter(
      (key) => !currentKeys.includes(key),
    );
    if (removed.length > 0) {
      setValue(
        "classOptions",
        classOptions.filter((option) => !removed.includes(option.optionKey)),
      );
    }
    prevGroupKeysRef.current = currentKeys;
  }, [groups, classOptions, setValue]);

  function setOption(optionKey: string, valueId: string) {
    const next: ClassOption[] = classOptions.filter(
      (option) => option.optionKey !== optionKey,
    );
    if (valueId) next.push({ optionKey, valueId });
    setValue("classOptions", next);
  }

  if (!enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Escolha uma classe para ver as características.
      </p>
    );
  }

  if (optionsQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem escolhas de classe neste nível.
      </p>
    );
  }

  return (
    <WizardFormSection title="Características de classe" compact>
      <FieldError errors={error ? [{ message: error }] : []} />
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => {
          const selected = classOptions.find(
            (option) => option.optionKey === group.optionKey,
          )?.valueId;
          const selectedValue = group.values.find(
            (value) => value.valueId === selected,
          );
          return (
            <div key={group.optionKey} className="space-y-1.5">
              <CatalogSelect
                id={`class-opt-${group.optionKey}`}
                label={`${group.label} (nv. ${group.unlockLevel})`}
                options={group.values.map((value) => ({
                  value: value.valueId,
                  label: value.label,
                  hint: truncateChoiceHint(value.benefit),
                }))}
                value={selected ?? ""}
                onChange={(event) =>
                  setOption(group.optionKey, event.target.value)
                }
              />
              {selectedValue?.benefit ? (
                <ChoicePreviewPanel
                  title={selectedValue.label}
                  subtitle={group.label}
                  teaser={selectedValue.benefit}
                  detailText={selectedValue.benefit}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </WizardFormSection>
  );
}
