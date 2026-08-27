"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { featInstanceKey } from "@/entities/character/lib/character-feat";
import type {
  FeatOption,
  SpeciesChoice,
} from "@/entities/character/sheet-types";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { featSlugsGrantedOutsideSpecies } from "@/features/character/create-character/lib/feats/origin-feat-options";
import {
  HUMAN_ORIGIN_FEAT_KIND,
  resolveCreateCharacterFeats,
} from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  useBackgroundDetail,
  useBackgroundSkills,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useSpeciesTraitChoices } from "@/features/catalog/species-catalog/api/use-species";
import {
  useFeatLabels,
  useFeats,
} from "@/features/catalog/reference-catalog/api/use-reference";

export type SpeciesTraitChoiceGroup = {
  kind: string;
  traitName: string;
  options: {
    choiceSlug: string;
    choiceName: string;
    level1Benefit: string | null;
  }[];
};

export function useStepSpeciesChoices(
  control: Control<CreateCharacterInput>,
  setValue: UseFormSetValue<CreateCharacterInput>,
  fallbackSpeciesSlug?: string,
) {
  const speciesSlugRaw = useWatch({
    control,
    name: "speciesSlug",
  });
  const speciesSlug = speciesSlugRaw || fallbackSpeciesSlug || "";
  const speciesChoicesWatch = useWatch({
    control,
    name: "speciesChoices",
  });
  const speciesChoices = useMemo(
    () => speciesChoicesWatch ?? [],
    [speciesChoicesWatch],
  );
  const backgroundSlug =
    useWatch({
      control,
      name: "backgroundSlug",
    }) ?? "";
  const asiFeatSlotSlugsWatch = useWatch({
    control,
    name: "asiFeatSlotSlugs",
  });
  const asiFeatSlotSlugs = useMemo(
    () => asiFeatSlotSlugsWatch ?? [],
    [asiFeatSlotSlugsWatch],
  );
  const featOptions =
    useWatch({
      control,
      name: "featOptions",
    }) ?? [];
  const level =
    useWatch({
      control,
      name: "level",
    }) ?? 1;
  const classSlug =
    useWatch({
      control,
      name: "classSlug",
    }) ?? "";
  const classSkillSlugsWatch = useWatch({
    control,
    name: "classSkillSlugs",
  });
  const classSkillSlugs = useMemo(
    () => classSkillSlugsWatch ?? [],
    [classSkillSlugsWatch],
  );
  const backgroundToolItemSlug =
    useWatch({
      control,
      name: "backgroundToolItemSlug",
    }) ?? "";
  const backgroundOriginFeatSlug =
    useWatch({
      control,
      name: "backgroundOriginFeatSlug",
    }) ?? "";

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
  const featLabels = useFeatLabels();
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

  const featSlugsFromOtherSources = useMemo(
    () =>
      featSlugsGrantedOutsideSpecies({
        backgroundOriginFeatSlug:
          backgroundDetail.data?.originFeatSlug?.trim() ||
          backgroundOriginFeatSlug?.trim() ||
          null,
        asiFeatSlotSlugs,
        selectedOriginFeatSlug: speciesChoices.find(
          (choice) => choice.choiceKind === HUMAN_ORIGIN_FEAT_KIND,
        )?.choiceSlug,
      }),
    [
      asiFeatSlotSlugs,
      backgroundDetail.data?.originFeatSlug,
      backgroundOriginFeatSlug,
      speciesChoices,
    ],
  );

  const groups = useMemo((): SpeciesTraitChoiceGroup[] => {
    const map = new Map<
      string,
      {
        traitName: string;
        options: {
          choiceSlug: string;
          choiceName: string;
          level1Benefit: string | null;
        }[];
      }
    >();

    const elfLineage = speciesChoices.find(
      (c) => c.choiceKind === "elf_lineage",
    )?.choiceSlug;
    const bearfolkLineage = speciesChoices.find(
      (c) => c.choiceKind === "bearfolk_lineage",
    )?.choiceSlug;
    const geppettinConstruction = speciesChoices.find(
      (c) => c.choiceKind === "geppettin_construction",
    )?.choiceSlug;

    for (const row of traitChoices.data?.data ?? []) {
      if (row.choiceKind === "high_elf_cantrip" && elfLineage !== "high-elf") {
        continue;
      }
      if (
        row.choiceKind === "andari_druid_cantrip" &&
        bearfolkLineage !== "andari"
      ) {
        continue;
      }
      if (
        row.choiceKind === "geppettin_size" &&
        row.choiceSlug === "medium" &&
        geppettinConstruction !== "marionette"
      ) {
        continue;
      }
      const group = map.get(row.choiceKind) ?? {
        traitName: row.traitName,
        options: [],
      };
      group.options.push({
        choiceSlug: row.choiceSlug,
        choiceName: row.choiceName,
        level1Benefit: row.level1Benefit,
      });
      map.set(row.choiceKind, group);
    }

    return [...map.entries()].map(([kind, group]) => ({
      kind,
      traitName: group.traitName,
      options:
        kind === HUMAN_ORIGIN_FEAT_KIND
          ? group.options.filter(
              (option) => !featSlugsFromOtherSources.has(option.choiceSlug),
            )
          : group.options,
    }));
  }, [featSlugsFromOtherSources, speciesChoices, traitChoices.data?.data]);

  const featNameBySlug = useMemo(() => {
    const map = Object.fromEntries(
      (featLabels.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
    );
    for (const feat of featsCatalog.data?.data ?? []) {
      map[feat.slug] = feat.name;
    }
    const originSlug = backgroundDetail.data?.originFeatSlug?.trim();
    const originName = backgroundDetail.data?.originFeatName?.trim();
    if (originSlug && originName) {
      map[originSlug] = originName;
    }
    return map;
  }, [
    backgroundDetail.data?.originFeatName,
    backgroundDetail.data?.originFeatSlug,
    featLabels.data?.data,
    featsCatalog.data?.data,
  ]);

  const previewFeats = useMemo(
    () =>
      resolveCreateCharacterFeats(
        backgroundDetail.data?.originFeatSlug?.trim() ||
          backgroundOriginFeatSlug?.trim() ||
          null,
        asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
        speciesChoices,
      ),
    [
      asiFeatSlotSlugs,
      backgroundDetail.data?.originFeatSlug,
      backgroundOriginFeatSlug,
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
    if (kind === "bearfolk_lineage" && slug !== "andari") {
      next = next.filter((c) => c.choiceKind !== "andari_druid_cantrip");
    }
    setValue("speciesChoices", next);

    const nextPreview = resolveCreateCharacterFeats(
      backgroundDetail.data?.originFeatSlug?.trim() ||
        backgroundOriginFeatSlug?.trim() ||
        null,
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
