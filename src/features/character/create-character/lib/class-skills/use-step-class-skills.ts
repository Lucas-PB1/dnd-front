"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import {
  allowedExpertiseSkillSlugsForClass,
  classExpertiseSlotsAtLevel,
  isClassExpertiseOptionKey,
} from "@/entities/character/lib/class-expertise-slots";
import {
  classExtraSkillSlotsAtLevel,
  isClassExtraSkillOptionKey,
} from "@/entities/character/lib/class-extra-skill-slots";
import {
  classWeaponMasterySlotsAtLevel,
  isClassWeaponMasteryOptionKey,
  parseWeaponMasteryEligibility,
} from "@/entities/character/lib/class-weapon-mastery-slots";
import { isWeaponProficient } from "@/entities/character/lib/weapon-proficiency";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { truncateChoiceHint } from "@/features/character/create-character/ui/choice-preview-panel";
import { useBackgroundSkills } from "@/features/catalog/background-catalog/api/use-backgrounds";
import {
  useClassDetail,
  useClassProgression,
  useClassSkills,
} from "@/features/catalog/class-catalog/api/use-classes";
import {
  fetchAllWeapons,
  weaponKeys,
} from "@/features/catalog/equipment-catalog/api/weapons.api";
import { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";

export function useStepClassSkills(
  control: Control<CreateCharacterInput>,
  setValue: UseFormSetValue<CreateCharacterInput>,
) {
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
  const options = useMemo(
    () => classSkills.data?.data ?? [],
    [classSkills.data?.data],
  );
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

  const extraSkillSlots = useMemo(
    () => classExtraSkillSlotsAtLevel(classSlug, level),
    [classSlug, level],
  );
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

  const extraSkillCandidates = useMemo(() => {
    const proficient = new Set(proficientSlugs);
    return options
      .filter((skill) => !proficient.has(skill.slug) && !backgroundSkillSlugs.has(skill.slug))
      .map((skill) => ({
        value: skill.slug,
        label: skill.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt"));
  }, [options, proficientSlugs, backgroundSkillSlugs]);

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

  const weaponProficiencySlugs = useMemo(
    () => classDetail.data?.weaponProficiencySlugs ?? [],
    [classDetail.data?.weaponProficiencySlugs],
  );

  const masteryCandidates = useMemo(() => {
    const items = weapons.data?.data ?? [];
    return items
      .filter((weapon) => weapon.mastery)
      .filter((weapon) => {
        const props = weapon.propertyDetails.map((p) => p.slug);
        if (masteryEligibility === "melee") {
          return !(props.includes("ammunition") && !props.includes("thrown"));
        }
        if (masteryEligibility === "ranged") {
          return props.includes("ammunition");
        }
        return true;
      })
      .filter((weapon) =>
        isWeaponProficient(
          {
            itemSlug: weapon.slug,
            category: weapon.category,
            propertySlugs: weapon.propertyDetails.map((p) => p.slug),
          },
          weaponProficiencySlugs,
        ),
      )
      .map((weapon) => ({
        value: weapon.slug,
        label: `${weapon.name}${weapon.mastery ? ` · ${weapon.mastery.name}` : ""}`,
        hint: truncateChoiceHint(weapon.mastery?.description),
        masteryName: weapon.mastery?.name ?? null,
        masteryDescription: weapon.mastery?.description ?? null,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt"));
  }, [weapons.data?.data, masteryEligibility, weaponProficiencySlugs]);

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
    const without = classOptions.filter(
      (option) => option.optionKey !== optionKey,
    );
    if (!valueId) {
      setValue("classOptions", without);
      return;
    }
    setValue("classOptions", [...without, { optionKey, valueId }]);
  }

  function setMasteryWeapon(optionKey: string, valueId: string) {
    setExpertise(optionKey, valueId);
  }

  const extraSkillFilled = classOptions.filter((option) =>
    isClassExtraSkillOptionKey(option.optionKey),
  ).length;
  const expertiseFilled = classOptions.filter((option) =>
    isClassExpertiseOptionKey(option.optionKey),
  ).length;
  const masteryFilled = classOptions.filter((option) =>
    isClassWeaponMasteryOptionKey(option.optionKey),
  ).length;

  const showSkillPicker = requiredCount > 0 && options.length > 0;
  const isLoading = classSkills.isPending || classDetail.isPending;

  return {
    classSlug,
    classSkillSlugs,
    classOptions,
    backgroundSkillSlugs,
    requiredCount,
    options,
    atLimit,
    extraSkillSlots,
    extraSkillCandidates,
    extraSkillFilled,
    expertiseSlots,
    masterySlots,
    masteryEligibility,
    expertiseCandidates,
    masteryCandidates,
    expertiseFilled,
    masteryFilled,
    showSkillPicker,
    isLoading,
    toggleSkill,
    setExpertise,
    setMasteryWeapon,
  };
}
