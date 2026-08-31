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
  isGhHeritageTraitSlot,
  isGrimHollowHeritageSlug,
} from "@/features/character/create-character/lib/species/grim-hollow-heritage";
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
  useHeritageDetail,
  useHeritageTraditionalBuild,
  useHeritageTraitChoices,
} from "@/features/catalog/heritage-catalog/api/use-heritages";
import {
  buildTraditionalHeritageChoices,
} from "@/entities/heritage";
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
  fallbackHeritageSlug?: string,
) {
  const speciesSlugRaw = useWatch({
    control,
    name: "speciesSlug",
  });
  const heritageSlugRaw = useWatch({
    control,
    name: "heritageSlug",
  });
  const speciesSlug = speciesSlugRaw || fallbackSpeciesSlug || "";
  const heritageSlug = heritageSlugRaw || fallbackHeritageSlug || "";
  const originSlug = heritageSlug || speciesSlug;
  const isHeritageOrigin = Boolean(heritageSlug);
  const speciesChoicesWatch = useWatch({
    control,
    name: "speciesChoices",
  });
  const heritageChoicesWatch = useWatch({
    control,
    name: "heritageChoices",
  });
  const speciesChoices = useMemo(
    () => speciesChoicesWatch ?? [],
    [speciesChoicesWatch],
  );
  const heritageChoices = useMemo(
    () => heritageChoicesWatch ?? [],
    [heritageChoicesWatch],
  );
  const originChoices = isHeritageOrigin ? heritageChoices : speciesChoices;
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

  const speciesTraitChoices = useSpeciesTraitChoices(
    speciesSlug,
    !isHeritageOrigin && !!speciesSlug,
  );
  const heritageTraitChoices = useHeritageTraitChoices(
    heritageSlug,
    isHeritageOrigin && !!heritageSlug,
  );
  const heritageDetail = useHeritageDetail(
    heritageSlug,
    isHeritageOrigin && !!heritageSlug,
  );
  const heritageTraditional = useHeritageTraditionalBuild(
    heritageSlug,
    isHeritageOrigin && !!heritageSlug,
  );
  const traitChoices = isHeritageOrigin
    ? heritageTraitChoices
    : speciesTraitChoices;
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
    const ghSpeedTrade = originChoices.find(
      (c) =>
        c.choiceKind === "heritage_speed_trade" ||
        c.choiceKind === "gh_heritage_speed_trade",
    )?.choiceSlug;

    for (const row of isHeritageOrigin
      ? (heritageTraitChoices.data ?? [])
      : (speciesTraitChoices.data?.data ?? [])) {
      if (isHeritageOrigin) {
        const heritageRow = row as import("@/entities/heritage/types").HeritageTraitChoice;
        const choiceKind = heritageRow.choiceKind;
        if (choiceKind === "heritage_trait_9" && ghSpeedTrade !== "yes") {
          continue;
        }
        const traitName = heritageRow.traitName ?? heritageRow.label ?? choiceKind;
        const group = map.get(choiceKind) ?? { traitName, options: [] };
        if (
          !group.options.some(
            (option) => option.choiceSlug === heritageRow.traitSlug,
          )
        ) {
          group.options.push({
            choiceSlug: heritageRow.traitSlug,
            choiceName: heritageRow.label ?? traitName,
            level1Benefit: heritageRow.benefitBase ?? null,
          });
        }
        map.set(choiceKind, group);
        continue;
      }

      const speciesRow = row as {
        choiceKind: string;
        traitName: string;
        choiceSlug: string;
        choiceName: string;
        level1Benefit: string | null;
      };
      if (speciesRow.choiceKind === "high_elf_cantrip" && elfLineage !== "high-elf") {
        continue;
      }
      if (
        speciesRow.choiceKind === "andari_druid_cantrip" &&
        bearfolkLineage !== "andari"
      ) {
        continue;
      }
      if (
        speciesRow.choiceKind === "geppettin_size" &&
        speciesRow.choiceSlug === "medium" &&
        geppettinConstruction !== "marionette"
      ) {
        continue;
      }
      const group = map.get(speciesRow.choiceKind) ?? {
        traitName: speciesRow.traitName,
        options: [],
      };
      group.options.push({
        choiceSlug: speciesRow.choiceSlug,
        choiceName: speciesRow.choiceName,
        level1Benefit: speciesRow.level1Benefit,
      });
      map.set(speciesRow.choiceKind, group);
    }

    return [...map.entries()]
      .sort(([left], [right]) => {
        const slotLeft = left.match(/^(?:heritage|gh_heritage)_trait_(\d+)$/);
        const slotRight = right.match(/^(?:heritage|gh_heritage)_trait_(\d+)$/);
        if (slotLeft && slotRight) {
          return Number(slotLeft[1]) - Number(slotRight[1]);
        }
        if (left.endsWith("_speed_trade")) return -1;
        if (right.endsWith("_speed_trade")) return 1;
        if (left.endsWith("_size")) return 1;
        if (right.endsWith("_size")) return -1;
        return left.localeCompare(right, "pt");
      })
      .map(([kind, group]) => ({
      kind,
      traitName: group.traitName,
      options:
        kind === HUMAN_ORIGIN_FEAT_KIND
          ? group.options.filter(
              (option) => !featSlugsFromOtherSources.has(option.choiceSlug),
            )
          : group.options,
    }));
  }, [
    featSlugsFromOtherSources,
    isHeritageOrigin,
    originChoices,
    speciesChoices,
    heritageTraitChoices.data,
    speciesTraitChoices.data?.data,
  ]);

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
    const current = isHeritageOrigin ? heritageChoices : speciesChoices;
    let next: SpeciesChoice[] = current.filter((c) => c.choiceKind !== kind);
    if (slug) {
      next.push({ choiceKind: kind, choiceSlug: slug });
    }
    if (!isHeritageOrigin) {
      if (kind === "elf_lineage" && slug !== "high-elf") {
        next = next.filter((c) => c.choiceKind !== "high_elf_cantrip");
      }
      if (kind === "bearfolk_lineage" && slug !== "andari") {
        next = next.filter((c) => c.choiceKind !== "andari_druid_cantrip");
      }
    }
    if (
      (kind === "heritage_speed_trade" || kind === "gh_heritage_speed_trade") &&
      slug !== "yes"
    ) {
      next = next.filter(
        (c) =>
          c.choiceKind !== "heritage_trait_9" &&
          c.choiceKind !== "gh_heritage_trait_9",
      );
    }
    if (isHeritageOrigin) {
      setValue("heritageChoices", next);
    } else {
      setValue("speciesChoices", next);
    }

    const nextPreview = resolveCreateCharacterFeats(
      backgroundDetail.data?.originFeatSlug?.trim() ||
        backgroundOriginFeatSlug?.trim() ||
        null,
      asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
      isHeritageOrigin ? speciesChoices : next,
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

  function applyTraditionalBuild() {
    const traditional = heritageTraditional.data ?? [];
    const detail = heritageDetail.data;
    if (!traditional.length || !detail) return;
    const picks = buildTraditionalHeritageChoices(traditional, {
      allowsSpeedTrade: detail.allowsSpeedTrade,
      allowsSizeChoice: detail.allowsSizeChoice,
      speedTrade: "no",
    });
    setValue("heritageChoices", picks);
  }

  return {
    speciesSlug: originSlug,
    heritageSlug,
    isHeritageOrigin,
    isGhHeritage: isHeritageOrigin || isGrimHollowHeritageSlug(originSlug),
    speciesChoices: originChoices,
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
    applyTraditionalBuild,
    canApplyTraditionalBuild:
      isHeritageOrigin && (heritageTraditional.data?.length ?? 0) >= 8,
    setChoice,
    setFeatOptions,
  };
}
