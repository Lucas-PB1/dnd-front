"use client";

import { useEffect, useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { SubclassOption } from "@/entities/character/sheet-types";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  useClassDetail,
  useSubclassOptions,
} from "@/features/catalog/class-catalog/api/use-classes";
import {
  FIGHTING_STYLE_FEAT_CATEGORY,
  collectTakenFightingStyleSlugs,
  filterAllowedFightingStyleValues,
  isFightingStyleSubclassOptionKey,
} from "@/features/catalog/feat-catalog/lib/fighting-style-feat-options";
import { useFeats } from "@/features/catalog/reference-catalog/api/use-reference";
import { useBackgroundSkills } from "@/features/catalog/background-catalog/api/use-backgrounds";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { useSubclassOptionCatalog } from "@/features/character/create-character/lib/subclass/use-subclass-option-catalog";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { SubclassOptionField } from "@/features/character/create-character/ui/steps/subclass/subclass-option-field";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
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
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const classSkillSlugs = useWatch({
    control,
    name: "classSkillSlugs",
    defaultValue: [],
  });
  const speciesChoices = useWatch({
    control,
    name: "speciesChoices",
    defaultValue: [],
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
  const backgroundSkills = useBackgroundSkills(
    backgroundSlug,
    enabled && !!backgroundSlug,
  );
  const featsCatalog = useFeats();
  const groups = optionsQuery.data?.data ?? [];
  const catalog = useSubclassOptionCatalog(groups, level, classSlug);

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
  const skillKinds = useMemo(() => skillChoiceKinds(), []);

  const proficientSlugs = useMemo(() => {
    const fromSpecies = speciesChoices
      .filter((choice) => skillKinds.has(choice.choiceKind))
      .map((choice) => choice.choiceSlug);
    const fromBackground = (backgroundSkills.data?.data ?? []).map(
      (skill) => skill.slug,
    );
    return [
      ...new Set([...classSkillSlugs, ...fromBackground, ...fromSpecies]),
    ];
  }, [
    backgroundSkills.data?.data,
    classSkillSlugs,
    skillKinds,
    speciesChoices,
  ]);

  useEffect(() => {
    if (!enabled) {
      setValue("subclassOptions", []);
    }
  }, [enabled, setValue]);

  function setOption(optionKey: string, valueId: string) {
    const next: SubclassOption[] = subclassOptions.filter(
      (option) => option.optionKey !== optionKey,
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
          const selected =
            subclassOptions.find((option) => option.optionKey === group.optionKey)
              ?.valueId ?? "";

          const isFightingStyle =
            group.valueType === "fighting_style" ||
            isFightingStyleSubclassOptionKey(group.optionKey);

          if (isFightingStyle && classFightingStyles.length > 0) {
            const taken = collectTakenFightingStyleSlugs({
              characterFeatSlugs: asiFeatSlotSlugs.filter(Boolean),
              fightingStyleFeatSlugs,
              subclassOptions: subclassOptions.filter(
                (option) => option.optionKey !== group.optionKey,
              ),
            });
            let valueOptions = filterAllowedFightingStyleValues(
              group.values,
              classFightingStyles,
              taken,
            );
            if (
              selected &&
              !valueOptions.some((value) => value.valueId === selected)
            ) {
              const current = group.values.find(
                (value) => value.valueId === selected,
              );
              if (current) {
                valueOptions = [current, ...valueOptions];
              }
            }
            return (
              <SubclassOptionField
                key={group.optionKey}
                group={{ ...group, values: valueOptions }}
                level={level}
                selected={selected}
                subclassOptions={subclassOptions}
                proficientSlugs={proficientSlugs}
                allSkills={catalog.allSkills}
                fighterClassSkills={catalog.fighterClassSkills}
                loreSpells={catalog.loreSpells}
                wizardSpells={catalog.wizardSpells}
                clericCantrips={catalog.clericCantrips}
                onChange={(valueId) => setOption(group.optionKey, valueId)}
              />
            );
          }

          const isLoading =
            (group.valueType === "skill_list" && catalog.allSkillsLoading) ||
            (group.optionKey === "warScholarSkill" &&
              catalog.fighterSkillsLoading) ||
            (group.valueType === "spell" &&
              (group.optionKey.startsWith("magicalDiscovery")
                ? catalog.loreSpellsLoading
                : group.optionKey.startsWith("holyRevelationCantrip")
                  ? catalog.clericCantripsLoading
                  : catalog.wizardSpellsLoading));

          return (
            <SubclassOptionField
              key={group.optionKey}
              group={group}
              level={level}
              selected={selected}
              subclassOptions={subclassOptions}
              proficientSlugs={proficientSlugs}
              allSkills={catalog.allSkills}
              fighterClassSkills={catalog.fighterClassSkills}
              loreSpells={catalog.loreSpells}
              wizardSpells={catalog.wizardSpells}
              clericCantrips={catalog.clericCantrips}
              isLoading={isLoading}
              onChange={(valueId) => setOption(group.optionKey, valueId)}
            />
          );
        })}
      </div>
    </WizardFormSection>
  );
}
