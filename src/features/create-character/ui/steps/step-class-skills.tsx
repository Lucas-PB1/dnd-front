"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import {
  allowedExpertiseSkillSlugsForClass,
  classExpertiseSlotsAtLevel,
  isClassExpertiseOptionKey,
} from "@/entities/character/lib/class-expertise-slots";
import {
  classWeaponMasterySlotsAtLevel,
  isClassWeaponMasteryOptionKey,
  parseWeaponMasteryEligibility,
} from "@/entities/character/lib/class-weapon-mastery-slots";
import { skillChoiceKinds } from "@/features/create-character/lib/granted-proficiencies";
import {
  useClassDetail,
  useClassProgression,
  useClassSkills,
} from "@/features/class-catalog/api/use-classes";
import { useBackgroundSkills } from "@/features/background-catalog/api/use-backgrounds";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { useSkills } from "@/features/reference-catalog/api/use-reference";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllWeapons,
  weaponKeys,
} from "@/features/equipment-catalog/api/weapons.api";
import { FieldError } from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

type StepClassSkillsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepClassSkills({
  control,
  setValue,
  error,
}: StepClassSkillsProps) {
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const level = useWatch({ control, name: "level", defaultValue: 1 });
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
  const classOptions = useWatch({
    control,
    name: "classOptions",
    defaultValue: [],
  });

  const classDetail = useClassDetail(classSlug, !!classSlug);
  const classSkills = useClassSkills(classSlug, !!classSlug);
  const progression = useClassProgression(classSlug, !!classSlug);
  const weapons = useQuery({
    queryKey: weaponKeys.allMastery(),
    queryFn: fetchAllWeapons,
    enabled: !!classSlug,
  });
  const backgroundSkills = useBackgroundSkills(
    backgroundSlug,
    !!backgroundSlug,
  );
  const allSkills = useSkills();

  const requiredCount = classDetail.data?.skillChoiceCount ?? 0;
  const options = classSkills.data?.data ?? [];
  const backgroundSkillSlugs = useMemo(
    () => new Set((backgroundSkills.data?.data ?? []).map((s) => s.slug)),
    [backgroundSkills.data?.data],
  );
  const atLimit = requiredCount > 0 && classSkillSlugs.length >= requiredCount;

  const skillKinds = useMemo(() => skillChoiceKinds(), []);
  const proficientSlugs = useMemo(() => {
    const fromSpecies = speciesChoices
      .filter((choice) => skillKinds.has(choice.choiceKind))
      .map((choice) => choice.choiceSlug);
    return [
      ...new Set([
        ...classSkillSlugs,
        ...backgroundSkillSlugs,
        ...fromSpecies,
      ]),
    ];
  }, [backgroundSkillSlugs, classSkillSlugs, skillKinds, speciesChoices]);

  const expertiseSlots = useMemo(
    () => classExpertiseSlotsAtLevel(classSlug, level),
    [classSlug, level],
  );
  const masterySlots = useMemo(
    () =>
      classWeaponMasterySlotsAtLevel(progression.data?.data ?? [], level),
    [progression.data?.data, level],
  );
  const masteryEligibility = useMemo(
    () =>
      parseWeaponMasteryEligibility(
        classDetail.data?.weaponMasteryEligibility,
      ),
    [classDetail.data?.weaponMasteryEligibility],
  );
  const whitelist = useMemo(
    () => allowedExpertiseSkillSlugsForClass(classSlug),
    [classSlug],
  );

  const skillNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const skill of allSkills.data?.data ?? []) {
      map.set(skill.slug, skill.name);
    }
    for (const skill of options) {
      map.set(skill.slug, skill.name);
    }
    return map;
  }, [allSkills.data?.data, options]);

  const expertiseCandidates = useMemo(() => {
    let slugs = proficientSlugs;
    if (whitelist) {
      slugs = slugs.filter((slug) => whitelist.includes(slug));
    }
    return slugs
      .map((slug) => ({
        value: slug,
        label: skillNameBySlug.get(slug) ?? slug,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt"));
  }, [proficientSlugs, skillNameBySlug, whitelist]);

  const masteryCandidates = useMemo(() => {
    const items = weapons.data?.data ?? [];
    return items
      .filter((weapon) => weapon.mastery)
      .filter((weapon) => {
        if (masteryEligibility !== "melee") return true;
        const props = weapon.propertyDetails.map((p) => p.slug);
        return !(props.includes("ammunition") && !props.includes("thrown"));
      })
      .map((weapon) => ({
        value: weapon.slug,
        label: `${weapon.name}${weapon.mastery ? ` · ${weapon.mastery.name}` : ""}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt"));
  }, [weapons.data?.data, masteryEligibility]);

  function toggleSkill(slug: string) {
    if (backgroundSkillSlugs.has(slug)) return;
    const selected = classSkillSlugs.includes(slug);
    if (selected) {
      const nextSkills = classSkillSlugs.filter((s) => s !== slug);
      setValue("classSkillSlugs", nextSkills);
      setValue(
        "classOptions",
        classOptions.filter((option) => option.valueId !== slug),
      );
      return;
    }
    if (requiredCount > 0 && classSkillSlugs.length >= requiredCount) {
      return;
    }
    setValue("classSkillSlugs", [...classSkillSlugs, slug]);
  }

  function setExpertise(optionKey: string, valueId: string) {
    const without = classOptions.filter((option) => option.optionKey !== optionKey);
    if (!valueId) {
      setValue("classOptions", without);
      return;
    }
    setValue("classOptions", [...without, { optionKey, valueId }]);
  }

  function setMasteryWeapon(optionKey: string, valueId: string) {
    setExpertise(optionKey, valueId);
  }

  const expertiseFilled = classOptions.filter((option) =>
    isClassExpertiseOptionKey(option.optionKey),
  ).length;
  const masteryFilled = classOptions.filter((option) =>
    isClassWeaponMasteryOptionKey(option.optionKey),
  ).length;

  if (!classSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Volte à identidade e escolha uma classe.
      </p>
    );
  }

  if (classSkills.isPending || classDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando perícias…</p>
    );
  }

  const showSkillPicker = requiredCount > 0 && options.length > 0;

  return (
    <div className="space-y-4">
      {showSkillPicker ? (
        <WizardFormSection
          title={`Perícias · ${classSkillSlugs.length}/${requiredCount}`}
          compact
        >
          <FieldError errors={error ? [{ message: error }] : []} />
          {backgroundSkillSlugs.size > 0 ? (
            <p className="text-xs text-muted-foreground">
              Perícias do antecedente já estão concedidas — escolha outras.
            </p>
          ) : null}
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((skill) => {
              const fromBackground = backgroundSkillSlugs.has(skill.slug);
              const checked = classSkillSlugs.includes(skill.slug);
              const disabled = fromBackground || (!checked && atLimit);

              return (
                <li key={skill.slug}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm",
                      checked && "border-primary bg-primary/5",
                      fromBackground && "border-muted bg-muted/40",
                      disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked || fromBackground}
                      disabled={disabled}
                      onChange={() => toggleSkill(skill.slug)}
                      className="size-4 rounded border-input"
                    />
                    <span>
                      {skill.name}
                      {fromBackground ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          · antecedente
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </WizardFormSection>
      ) : (
        <FieldError errors={error ? [{ message: error }] : []} />
      )}

      {expertiseSlots.length > 0 ? (
        <WizardFormSection
          title={`Especialização · ${expertiseFilled}/${expertiseSlots.length}`}
          compact
        >
          <p className="text-xs text-muted-foreground">
            Escolha perícias nas quais você já é proficiente (×2 PB).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {expertiseSlots.map((slot) => {
              const selected =
                classOptions.find((option) => option.optionKey === slot.optionKey)
                  ?.valueId ?? "";
              const takenElsewhere = new Set(
                classOptions
                  .filter(
                    (option) =>
                      isClassExpertiseOptionKey(option.optionKey) &&
                      option.optionKey !== slot.optionKey,
                  )
                  .map((option) => option.valueId),
              );
              const selectOptions = expertiseCandidates.filter(
                (candidate) =>
                  candidate.value === selected ||
                  !takenElsewhere.has(candidate.value),
              );
              return (
                <CatalogSelect
                  key={slot.optionKey}
                  id={slot.optionKey}
                  label={`Especialização (nv. ${slot.unlockLevel})`}
                  options={selectOptions}
                  value={selected}
                  onChange={(event) =>
                    setExpertise(slot.optionKey, event.target.value)
                  }
                />
              );
            })}
          </div>
        </WizardFormSection>
      ) : null}

      {masterySlots.length > 0 ? (
        <WizardFormSection
          title={`Maestria em Arma · ${masteryFilled}/${masterySlots.length}`}
          compact
        >
          <p className="text-xs text-muted-foreground">
            Escolha tipos de arma cuja propriedade de maestria você pode usar
            {masteryEligibility === "melee" ? " (corpo a corpo)" : ""}.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {masterySlots.map((slot) => {
              const selected =
                classOptions.find((option) => option.optionKey === slot.optionKey)
                  ?.valueId ?? "";
              const takenElsewhere = new Set(
                classOptions
                  .filter(
                    (option) =>
                      isClassWeaponMasteryOptionKey(option.optionKey) &&
                      option.optionKey !== slot.optionKey,
                  )
                  .map((option) => option.valueId),
              );
              const selectOptions = masteryCandidates.filter(
                (candidate) =>
                  candidate.value === selected ||
                  !takenElsewhere.has(candidate.value),
              );
              return (
                <CatalogSelect
                  key={slot.optionKey}
                  id={slot.optionKey}
                  label={`Maestria (nv. ${slot.unlockLevel})`}
                  options={selectOptions}
                  value={selected}
                  onChange={(event) =>
                    setMasteryWeapon(slot.optionKey, event.target.value)
                  }
                />
              );
            })}
          </div>
        </WizardFormSection>
      ) : null}
    </div>
  );
}
