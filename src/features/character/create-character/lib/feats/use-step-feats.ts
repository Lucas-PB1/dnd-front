"use client";

import { useEffect, useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { canAddCharacterFeat } from "@/entities/character/lib/character-feat";
import type { FeatOption } from "@/entities/character/sheet-types";
import { useBackgroundDetail } from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useBackgroundSkills } from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useClassDetail } from "@/features/catalog/class-catalog/api/use-classes";
import {
  asiFeatLevelsUpTo,
  countAsiFeatSlots,
} from "@/features/character/create-character/lib/feats/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { pruneFeatOptions } from "@/features/character/create-character/lib/feats/feat-options-prune";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  FIGHTING_STYLE_FEAT_CATEGORY,
  collectTakenFightingStyleSlugs,
} from "@/features/catalog/feat-catalog/lib/fighting-style-feat-options";
import { useFeats } from "@/features/catalog/reference-catalog/api/use-reference";

const ASI_FEAT_SLUG = "ability-score-improvement";

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

  const feats = useFeats();
  const classDetail = useClassDetail(classSlug, !!classSlug);
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
    return [...new Set([...classSkillSlugs, ...fromBackground, ...fromSpecies])];
  }, [backgroundSkills.data?.data, classSkillSlugs, skillKinds, speciesChoices]);

  const grantedToolSlugs = useMemo(() => {
    const tool =
      backgroundToolItemSlug?.trim() ||
      backgroundDetail.data?.toolItemSlug?.trim() ||
      "";
    return tool ? [tool] : [];
  }, [backgroundDetail.data?.toolItemSlug, backgroundToolItemSlug]);

  function slotFeatOptions(slotIndex: number) {
    const otherSlots = asiFeatSlotSlugs.map((slug, index) =>
      index === slotIndex ? "" : slug,
    );
    const otherFeats = asiFeatSlotsToCharacterFeats(otherSlots);
    const previewWithoutSlot = resolveCreateCharacterFeats(
      originFeatSlug,
      otherFeats,
      speciesChoices,
    );
    const currentSlotSlug = asiFeatSlotSlugs[slotIndex] ?? "";
    const takenStyles = collectTakenFightingStyleSlugs({
      characterFeatSlugs: [
        ...previewWithoutSlot.map((feat) => feat.featSlug),
        ...(fightingStyleSlug ? [fightingStyleSlug] : []),
      ],
      fightingStyleFeatSlugs,
      subclassOptions,
    });
    const allowedStyles = new Set(classDetail.data?.fightingStyleSlugs ?? []);

    return (feats.data?.data ?? []).filter((feat) => {
      if (
        !canAddCharacterFeat(previewWithoutSlot, feat.slug, feat.repeatable)
      ) {
        return false;
      }
      if (feat.categorySlug !== FIGHTING_STYLE_FEAT_CATEGORY) {
        return true;
      }
      if (feat.slug === currentSlotSlug) {
        return allowedStyles.has(feat.slug);
      }
      return allowedStyles.has(feat.slug) && !takenStyles.includes(feat.slug);
    });
  }

  function sortedSlotFeatOptions(slotIndex: number) {
    const list = slotFeatOptions(slotIndex);
    const asiFeat = list.find((f) => f.slug === ASI_FEAT_SLUG);
    const rest = list
      .filter((f) => f.slug !== ASI_FEAT_SLUG)
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
    return asiFeat ? [asiFeat, ...rest] : rest;
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
    setFightingStyle: (slug: string) =>
      setValue("fightingStyleFeatSlug", slug),
    setFeatOptions: (next: FeatOption[]) => setValue("featOptions", next),
  };
}
