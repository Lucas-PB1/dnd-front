"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { featInstanceKey } from "@/entities/character/lib/character-feat";
import type { FeatOption, SpeciesChoice } from "@/entities/character/sheet-types";
import { asiFeatSlotsToCharacterFeats } from "@/features/create-character/lib/feats/asi-feat-slots-to-feats";
import { skillChoiceKinds } from "@/features/create-character/lib/class-skills/granted-proficiencies";
import { resolveCreateCharacterFeats } from "@/features/create-character/lib/feats/preview-create-character-feats";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  useBackgroundDetail,
  useBackgroundSkills,
} from "@/features/background-catalog/api/use-backgrounds";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import { useFeats } from "@/features/reference-catalog/api/use-reference";

export type SpeciesTraitChoiceGroup = {
  kind: string;
  traitName: string;
  options: { choiceSlug: string; choiceName: string }[];
};

export function useStepSpeciesChoices(
  control: Control<CreateCharacterInput>,
  setValue: UseFormSetValue<CreateCharacterInput>,
) {
  const speciesSlug = useWatch({
    control,
    name: "speciesSlug",
    defaultValue: "",
  });
  const speciesChoices = useWatch({
    control,
    name: "speciesChoices",
    defaultValue: [],
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
  const level = useWatch({
    control,
    name: "level",
    defaultValue: 1,
  });
  const classSlug = useWatch({
    control,
    name: "classSlug",
    defaultValue: "",
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

  const traitChoices = useSpeciesTraitChoices(speciesSlug, !!speciesSlug);
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const backgroundSkills = useBackgroundSkills(
    backgroundSlug,
    !!backgroundSlug,
  );
  const featsCatalog = useFeats();
  const skillKinds = useMemo(() => skillChoiceKinds(), []);

  const grantedSkillSlugs = useMemo(() => {
    const fromBackground = (backgroundSkills.data?.data ?? []).map(
      (skill) => skill.slug,
    );
    return [...new Set([...classSkillSlugs, ...fromBackground])];
  }, [backgroundSkills.data?.data, classSkillSlugs]);

  const grantedToolSlugs = useMemo(() => {
    const tool =
      backgroundToolItemSlug?.trim() ||
      backgroundDetail.data?.toolItemSlug?.trim() ||
      "";
    return tool ? [tool] : [];
  }, [backgroundDetail.data?.toolItemSlug, backgroundToolItemSlug]);

  const groups = useMemo((): SpeciesTraitChoiceGroup[] => {
    const map = new Map<
      string,
      {
        traitName: string;
        options: { choiceSlug: string; choiceName: string }[];
      }
    >();

    const elfLineage = speciesChoices.find(
      (c) => c.choiceKind === "elf_lineage",
    )?.choiceSlug;

    for (const row of traitChoices.data?.data ?? []) {
      if (row.choiceKind === "high_elf_cantrip" && elfLineage !== "high-elf") {
        continue;
      }
      const group = map.get(row.choiceKind) ?? {
        traitName: row.traitName,
        options: [],
      };
      group.options.push({
        choiceSlug: row.choiceSlug,
        choiceName: row.choiceName,
      });
      map.set(row.choiceKind, group);
    }

    return [...map.entries()].map(([kind, group]) => ({
      kind,
      traitName: group.traitName,
      options: group.options,
    }));
  }, [speciesChoices, traitChoices.data?.data]);

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (featsCatalog.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [featsCatalog.data?.data],
  );

  const previewFeats = useMemo(
    () =>
      resolveCreateCharacterFeats(
        backgroundDetail.data?.originFeatSlug ?? null,
        asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
        speciesChoices,
      ),
    [
      asiFeatSlotSlugs,
      backgroundDetail.data?.originFeatSlug,
      speciesChoices,
    ],
  );

  const humanOriginFeatKeys = useMemo(() => {
    const humanFeat = speciesChoices.find(
      (c) => c.choiceKind === "human_origin_feat",
    );
    if (!humanFeat) return new Set<string>();
    const match = previewFeats.find((f) => f.featSlug === humanFeat.choiceSlug);
    if (!match) return new Set<string>();
    return new Set([featInstanceKey(match.featSlug, match.instanceIndex)]);
  }, [previewFeats, speciesChoices]);

  function setChoice(kind: string, slug: string) {
    let next: SpeciesChoice[] = speciesChoices.filter(
      (c) => c.choiceKind !== kind,
    );
    if (slug) {
      next.push({ choiceKind: kind, choiceSlug: slug });
    }
    if (kind === "elf_lineage" && slug !== "high-elf") {
      next = next.filter((c) => c.choiceKind !== "high_elf_cantrip");
    }
    setValue("speciesChoices", next);

    const nextPreview = resolveCreateCharacterFeats(
      backgroundDetail.data?.originFeatSlug ?? null,
      asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
      next,
    );
    const validKeys = new Set(
      nextPreview.map((f) => featInstanceKey(f.featSlug, f.instanceIndex)),
    );
    setValue(
      "featOptions",
      featOptions.filter((option) =>
        validKeys.has(featInstanceKey(option.featSlug, option.instanceIndex)),
      ),
    );
  }

  function setFeatOptions(next: FeatOption[]) {
    setValue("featOptions", next);
  }

  return {
    speciesSlug,
    speciesChoices,
    level,
    classSlug,
    featOptions,
    grantedSkillSlugs,
    grantedToolSlugs,
    groups,
    featNameBySlug,
    previewFeats,
    humanOriginFeatKeys,
    skillKinds,
    traitChoices,
    setChoice,
    setFeatOptions,
  };
}
