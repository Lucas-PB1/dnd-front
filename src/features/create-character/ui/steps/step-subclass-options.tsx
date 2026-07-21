"use client";

import { useEffect, useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { SubclassOption } from "@/entities/character/sheet-types";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  useClassDetail,
  useSubclassOptions,
} from "@/features/class-catalog/api/use-classes";
import {
  FIGHTING_STYLE_FEAT_CATEGORY,
  collectTakenFightingStyleSlugs,
  filterAllowedFightingStyleValues,
  isFightingStyleSubclassOptionKey,
} from "@/features/feat-catalog/lib/fighting-style-feat-options";
import { useFeats } from "@/features/reference-catalog/api/use-reference";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { FieldError } from "@/shared/ui/field";

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
  const classSlug = useWatch({
    control,
    name: "classSlug",
    defaultValue: "",
  });
  const asiFeatSlotSlugs = useWatch({
    control,
    name: "asiFeatSlotSlugs",
    defaultValue: [],
  });
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
  const classDetail = useClassDetail(classSlug, enabled && !!classSlug);
  const featsCatalog = useFeats();

  const fightingStyleFeatSlugs = useMemo(
    () =>
      new Set(
        (featsCatalog.data?.data ?? [])
          .filter((feat) => feat.categorySlug === FIGHTING_STYLE_FEAT_CATEGORY)
          .map((feat) => feat.slug),
      ),
    [featsCatalog.data?.data],
  );

  const classFightingStyles = classDetail.data?.fightingStyleSlugs ?? [];
  const groups = optionsQuery.data?.data ?? [];

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
        Nenhuma opção de subclasse neste nível.
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
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem opções selecionáveis neste nível.
      </p>
    );
  }

  return (
    <WizardFormSection title="Opções de subclasse" compact>
      <FieldError errors={error ? [{ message: error }] : []} />
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => {
          const selected = subclassOptions.find(
            (o) => o.optionKey === group.optionKey,
          )?.valueId;

          const isFightingStyle =
            group.valueType === "fighting_style" ||
            isFightingStyleSubclassOptionKey(group.optionKey);

          let valueOptions = group.values;
          if (isFightingStyle && classFightingStyles.length > 0) {
            const taken = collectTakenFightingStyleSlugs({
              characterFeatSlugs: asiFeatSlotSlugs.filter(Boolean),
              fightingStyleFeatSlugs: fightingStyleFeatSlugs,
              subclassOptions: subclassOptions.filter(
                (o) => o.optionKey !== group.optionKey,
              ),
            });
            valueOptions = filterAllowedFightingStyleValues(
              group.values,
              classFightingStyles,
              taken,
            );
            if (selected && !valueOptions.some((v) => v.valueId === selected)) {
              const current = group.values.find((v) => v.valueId === selected);
              if (current) {
                valueOptions = [current, ...valueOptions];
              }
            }
          }

          return (
            <CatalogSelect
              key={group.optionKey}
              id={`subclass-opt-${group.optionKey}`}
              label={`${group.label} (nv. ${group.unlockLevel})`}
              options={valueOptions.map((v) => ({
                value: v.valueId,
                label: v.label,
              }))}
              value={selected ?? ""}
              onChange={(e) => setOption(group.optionKey, e.target.value)}
            />
          );
        })}
      </div>
    </WizardFormSection>
  );
}
