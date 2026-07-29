"use client";

import { useEffect, useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { FeatOption } from "@/entities/character/sheet-types";
import { useBackgroundDetail } from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useBackgroundSkills } from "@/features/catalog/background-catalog/api/use-backgrounds";
import {
  useClassDetail,
  useClassSpellSlots,
} from "@/features/catalog/class-catalog/api/use-classes";
import {
  asiFeatLevelsUpTo,
  countAsiFeatSlots,
} from "@/features/character/create-character/lib/feats/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { pruneFeatOptions } from "@/features/character/create-character/lib/feats/feat-options-prune";
import {
  ASI_FEAT_SLUG,
  sortedAsiSlotFeatOptions,
} from "@/features/character/create-character/lib/feats/asi-slot-feat-options";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import { previewCreateCharacterAbilityScores } from "@/features/character/create-character/lib/review/preview-create-character";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  FIGHTING_STYLE_FEAT_CATEGORY,
  collectTakenFightingStyleSlugs,
} from "@/features/catalog/feat-catalog/lib/fighting-style-feat-options";
import { useFeats } from "@/features/catalog/reference-catalog/api/use-reference";

export function useStepFeats(
  control: Control<CreateCharacterInput>,
  setValue: UseFormSetValue<CreateCharacterInput>,
) {
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
  const asiFeatSlotSlugs = useWatch({
    control,
    name: "asiFeatSlotSlugs",
    defaultValue: [],
  });
  const featOptions = useWatch({
    control,
    name: "featOptions",
    defaultValue: [],
  });
  const fightingStyleFeatSlug = useWatch({
    control,
    name: "fightingStyleFeatSlug",
    defaultValue: "",
  });
  const speciesChoices = useWatch({
    control,
    name: "speciesChoices",
    defaultValue: [],
  });
  const subclassOptions = useWatch({
    control,
    name: "subclassOptions",
    defaultValue: [],
  });
  const classSkillSlugs = useWatch({
    control,
    name: "classSkillSlugs",
    defaultValue: [],
  });
  const backgroundToolItemSlug = useWatch({
    control,
    name: "backgroundToolItemSlug",
    defaultValue: "",
  });
  const abilityScores = useWatch({ control, name: "abilityScores" });
  const backgroundAbilityBoostMode = useWatch({
    control,
    name: "backgroundAbilityBoostMode",
  });
  const backgroundAbilityBoostPlus2Slug = useWatch({
    control,
    name: "backgroundAbilityBoostPlus2Slug",
  });
  const backgroundAbilityBoostPlus1Slug = useWatch({
    control,
    name: "backgroundAbilityBoostPlus1Slug",
  });
  const backgroundAbilityBoostPlus1Slugs = useWatch({
    control,
    name: "backgroundAbilityBoostPlus1Slugs",
  });

  const feats = useFeats();
  const classDetail = useClassDetail(classSlug, !!classSlug);
  const classSpellSlots = useClassSpellSlots(classSlug, !!classSlug);
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const backgroundSkills = useBackgroundSkills(
    backgroundSlug,
    !!backgroundSlug,
  );
  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? null;
  const originFeatName = backgroundDetail.data?.originFeatName ?? null;

  const asiSlotCount = countAsiFeatSlots(classSlug, level);
  const asiLevels = asiFeatLevelsUpTo(classSlug, level);
  const epicBoonFeatSlugs = useMemo(
    () =>
      new Set(
        (feats.data?.data ?? [])
          .filter((feat) => feat.categorySlug === "epic-boon")
          .map((feat) => feat.slug),
      ),
    [feats.data?.data],
  );
  const effectiveAbilityScores = useMemo(
    () =>
      previewCreateCharacterAbilityScores(
        {
          abilityScores,
          backgroundAbilityBoostMode,
          backgroundAbilityBoostPlus2Slug,
          backgroundAbilityBoostPlus1Slug,
          backgroundAbilityBoostPlus1Slugs,
          featOptions,
        },
        epicBoonFeatSlugs,
      ),
    [
      abilityScores,
      backgroundAbilityBoostMode,
      backgroundAbilityBoostPlus2Slug,
      backgroundAbilityBoostPlus1Slug,
      backgroundAbilityBoostPlus1Slugs,
      featOptions,
      epicBoonFeatSlugs,
    ],
  );
  const hasSpellcasting = (classSpellSlots.data?.data ?? []).some(
    (row) =>
      row.classLevel <= level &&
      (Object.values(row.spellSlots).some((slots) => slots > 0) ||
        (row.cantrips ?? 0) > 0),
  );

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (feats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [feats.data?.data],
  );

  const asiFeats = useMemo(
    () => asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
    [asiFeatSlotSlugs],
  );
  const fightingStyleFeatSlugs = useMemo(() => {
    return new Set(
      (feats.data?.data ?? [])
        .filter((feat) => feat.categorySlug === FIGHTING_STYLE_FEAT_CATEGORY)
        .map((feat) => feat.slug),
    );
  }, [feats.data?.data]);
  const fightingStyleSlug = fightingStyleFeatSlug?.trim() ?? "";
  const previewFeats = useMemo(() => {
    const withStyle =
      fightingStyleSlug &&
      !asiFeats.some((feat) => feat.featSlug === fightingStyleSlug)
        ? [...asiFeats, { featSlug: fightingStyleSlug, instanceIndex: 0 }]
        : asiFeats;
    return resolveCreateCharacterFeats(
      originFeatSlug,
      withStyle,
      speciesChoices,
    );
  }, [originFeatSlug, asiFeats, speciesChoices, fightingStyleSlug]);

  const classFightingStyleSlugs = useMemo(
    () => classDetail.data?.fightingStyleSlugs ?? [],
    [classDetail.data?.fightingStyleSlugs],
  );
  const showFightingStyleSection = classFightingStyleSlugs.length > 0;

  const fightingStyleOptions = useMemo(() => {
    const allowed = new Set(classFightingStyleSlugs);
    const takenElsewhere = collectTakenFightingStyleSlugs({
      characterFeatSlugs: asiFeats.map((feat) => feat.featSlug),
      fightingStyleFeatSlugs,
      subclassOptions,
    }).filter((slug) => slug !== fightingStyleSlug);

    return (feats.data?.data ?? [])
      .filter(
        (feat) =>
          feat.categorySlug === FIGHTING_STYLE_FEAT_CATEGORY &&
          allowed.has(feat.slug) &&
          !takenElsewhere.includes(feat.slug),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }, [
    classFightingStyleSlugs,
    asiFeats,
    fightingStyleFeatSlugs,
    subclassOptions,
    fightingStyleSlug,
    feats.data?.data,
  ]);

  useEffect(() => {
    if (asiFeatSlotSlugs.length < asiSlotCount) {
      const next = [...asiFeatSlotSlugs];
      while (next.length < asiSlotCount) next.push("");
      setValue("asiFeatSlotSlugs", next);
    }
  }, [asiSlotCount, asiFeatSlotSlugs.length, setValue, asiFeatSlotSlugs]);

  function updateAsiSlot(index: number, slug: string) {
    const nextSlots = [...asiFeatSlotSlugs];
    while (nextSlots.length < asiSlotCount) nextSlots.push("");
    nextSlots[index] = slug;
    setValue("asiFeatSlotSlugs", nextSlots);

    const styleFeat =
      fightingStyleSlug && !nextSlots.includes(fightingStyleSlug)
        ? [{ featSlug: fightingStyleSlug, instanceIndex: 0 as const }]
        : [];
    const nextPreview = resolveCreateCharacterFeats(
      originFeatSlug,
      [...asiFeatSlotsToCharacterFeats(nextSlots), ...styleFeat],
      speciesChoices,
    );
    setValue("featOptions", pruneFeatOptions(nextPreview, featOptions));
  }

  const skillKinds = useMemo(() => skillChoiceKinds(), []);
  const grantedSkillSlugs = useMemo(() => {
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

  const grantedToolSlugs = useMemo(() => {
    const tool =
      backgroundToolItemSlug?.trim() ||
      backgroundDetail.data?.toolItemSlug?.trim() ||
      "";
    return tool ? [tool] : [];
  }, [backgroundDetail.data?.toolItemSlug, backgroundToolItemSlug]);

  function sortedSlotFeatOptions(slotIndex: number) {
    return sortedAsiSlotFeatOptions({
      slotIndex,
      asiFeatSlotSlugs,
      originFeatSlug,
      speciesChoices,
      fightingStyleSlug,
      fightingStyleFeatSlugs,
      subclassOptions,
      classFightingStyleSlugs,
      feats: feats.data?.data ?? [],
      eligibility: {
        level,
        abilityScores: effectiveAbilityScores,
        hasSpellcasting,
        armorTrainingSlugs: classDetail.data?.armorTrainingSlugs ?? [],
        hasFightingStyleFeature: classFightingStyleSlugs.length > 0,
      },
    });
  }

  const showOriginSection = !!originFeatSlug;
  const showAsiSection = asiSlotCount > 0;

  return {
    ASI_FEAT_SLUG,
    level,
    classSlug,
    backgroundSlug,
    asiFeatSlotSlugs,
    featOptions,
    feats,
    classDetail,
    backgroundDetail,
    originFeatSlug,
    originFeatName,
    asiLevels,
    featNameBySlug,
    previewFeats,
    showFightingStyleSection,
    fightingStyleOptions,
    fightingStyleSlug,
    showOriginSection,
    showAsiSection,
    grantedSkillSlugs,
    grantedToolSlugs,
    updateAsiSlot,
    sortedSlotFeatOptions,
    setFightingStyle: (slug: string) => setValue("fightingStyleFeatSlug", slug),
    setFeatOptions: (next: FeatOption[]) => setValue("featOptions", next),
  };
}
