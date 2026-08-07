"use client";

import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { epicBoonFeatSlugsFromCatalog } from "@/entities/character/lib/epic-boon-feat-options";
import { BACKGROUND_BOOST_MODE_PLUS2_PLUS1 } from "@/entities/character/lib/background-boost";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  useBackgroundDetail,
  useBackgroundEquipment,
  useBackgroundLanguages,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import {
  useClassEquipment,
  useSubclassOptions,
} from "@/features/catalog/class-catalog/api/use-classes";
import { asiFeatLevelsUpTo } from "@/features/character/create-character/lib/feats/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { toolNameForSlug } from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";
import { groupEquipmentPackages } from "@/features/character/create-character/lib/equipment/equipment-selection";
import { languageQuota } from "@/features/character/create-character/lib/languages/language-selection";
import { previewCreateCharacter } from "@/features/character/create-character/lib/review/preview-create-character";
import {
  buildAsiLevelByFeatKey,
  groupFeatOptionsByInstance,
  resolveReviewEquipmentItemName,
  resolveReviewPackageLabel,
} from "@/features/character/create-character/lib/review/review-display";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { useFeatOptionLabels } from "@/features/catalog/feat-catalog/api/use-feat-option-labels";
import {
  useAbilityGenerationMethods,
  useFeats,
} from "@/features/catalog/reference-catalog/api/use-reference";
import { useSpeciesTraitChoices } from "@/features/catalog/species-catalog/api/use-species";
import { useSpells } from "@/features/catalog/spell-catalog/api/use-spells";

export function useStepReview(control: Control<CreateCharacterInput>) {
  const values = useWatch({ control }) as CreateCharacterInput;
  const featsQuery = useFeats();
  const abilityMethods = useAbilityGenerationMethods();
  const epicBoonFeatSlugs = useMemo(
    () => epicBoonFeatSlugsFromCatalog(featsQuery.data?.data ?? []),
    [featsQuery.data?.data],
  );
  const boostMode =
    values.backgroundAbilityBoostMode ?? BACKGROUND_BOOST_MODE_PLUS2_PLUS1;
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const plus1Slugs = values.backgroundAbilityBoostPlus1Slugs ?? [];
  const preview = useMemo(
    () => previewCreateCharacter(values, epicBoonFeatSlugs),
    [values, epicBoonFeatSlugs],
  );
  const labels = useCharacterCatalogLabels(preview);
  const finalScores = preview.abilityScores;

  const speciesTraits = useSpeciesTraitChoices(
    values.speciesSlug,
    !!values.speciesSlug,
  );
  const subclassOpts = useSubclassOptions(
    values.subclassSlug ?? "",
    values.level,
    isSubclassRequired(values.level) && !!values.subclassSlug,
  );
  const backgroundDetail = useBackgroundDetail(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const backgroundSkills = useBackgroundSkills(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const needsToolChoice =
    backgroundDetail.data?.toolProficiencyKind === "choice";
  const backgroundTools = useBackgroundTools(
    values.backgroundSlug,
    needsToolChoice,
  );
  const classEquipment = useClassEquipment(
    values.classSlug,
    !!values.classSlug,
  );
  const backgroundEquipment = useBackgroundEquipment(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const spellsCatalog = useSpells();

  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? "";
  const allFeats = useFeats();
  const fightingStyle = values.fightingStyleFeatSlug?.trim() ?? "";
  const previewFeats = resolveCreateCharacterFeats(
    originFeatSlug || null,
    [
      ...asiFeatSlotsToCharacterFeats(values.asiFeatSlotSlugs ?? []),
      ...(fightingStyle
        ? [{ featSlug: fightingStyle, instanceIndex: 0 }]
        : []),
    ],
    values.speciesChoices ?? [],
  );
  const featNameBySlug = Object.fromEntries(
    (allFeats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
  );
  const { resolveFeatOption, featOptionDefsFor, isLoading: featOptionsLoading } =
    useFeatOptionLabels({
      characterFeats: previewFeats,
      labelContext: {
        resolveSpell: labels.resolveSpell,
        resolveSkill: labels.resolveSkill,
      },
    });

  const backgroundLanguages = useBackgroundLanguages(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const langQuota = languageQuota({
    grantedSlugs: (backgroundLanguages.data?.data ?? []).map((row) => row.slug),
    languageChoiceCount: backgroundDetail.data?.languageChoiceCount ?? 2,
  });

  const classPackages = useMemo(
    () => groupEquipmentPackages(classEquipment.data?.data ?? []),
    [classEquipment.data?.data],
  );
  const backgroundPackages = useMemo(
    () => groupEquipmentPackages(backgroundEquipment.data?.data ?? []),
    [backgroundEquipment.data?.data],
  );

  const spellLevelBySlug = useMemo(() => {
    const map = new Map<string, number>();
    for (const spell of spellsCatalog.data?.data ?? []) {
      map.set(spell.slug, spell.level);
    }
    return map;
  }, [spellsCatalog.data?.data]);

  const toolLabel =
    backgroundDetail.data?.toolProficiencyKind === "fixed"
      ? (backgroundDetail.data.toolItemName ??
        backgroundDetail.data.toolItemSlug)
      : values.backgroundToolItemSlug
        ? (backgroundTools.data?.data.find(
            (t) => t.itemSlug === values.backgroundToolItemSlug,
          )?.itemName ??
          toolNameForSlug(values.backgroundToolItemSlug) ??
          values.backgroundToolItemSlug)
        : null;

  function speciesChoiceLabel(kind: string, slug: string) {
    const row = speciesTraits.data?.data.find(
      (r) => r.choiceKind === kind && r.choiceSlug === slug,
    );
    return row?.choiceName ?? slug;
  }

  function subclassOptionLabel(optionKey: string, valueId: string) {
    const group = subclassOpts.data?.data.find(
      (g) => g.optionKey === optionKey,
    );
    const value = group?.values.find((v) => v.valueId === valueId);
    return `${group?.label ?? optionKey}: ${value?.label ?? valueId}`;
  }

  function resolveEquipmentItemName(
    source: "class" | "background",
    packageSlug: string,
    itemSlug?: string,
  ) {
    return resolveReviewEquipmentItemName({
      source,
      packageSlug,
      itemSlug,
      classRows: classEquipment.data?.data ?? [],
      backgroundRows: backgroundEquipment.data?.data ?? [],
    });
  }

  function resolvePackageLabel(
    source: "class" | "background",
    packageSlug: string,
  ) {
    return resolveReviewPackageLabel({
      source,
      packageSlug,
      equipmentGoldOption: backgroundDetail.data?.equipmentGoldOption,
      classPackages,
      backgroundPackages,
    });
  }

  const optionsByFeatInstance = groupFeatOptionsByInstance(values.featOptions);

  const asiLevels = asiFeatLevelsUpTo(values.classSlug, values.level);
  const asiLevelByFeatKey = useMemo(
    () => buildAsiLevelByFeatKey(values.asiFeatSlotSlugs, asiLevels),
    [values.asiFeatSlotSlugs, asiLevels],
  );

  const methodLabel =
    abilityMethods.data?.find(
      (method) => method.slug === values.abilityGenerationMethodSlug,
    )?.name ?? values.abilityGenerationMethodSlug;

  const classSkillChips = values.classSkillSlugs.map((slug) => ({
    key: `class-${slug}`,
    label: labels.resolveSkill(slug),
    hint: "Classe",
  }));
  const backgroundSkillChips = (backgroundSkills.data?.data ?? []).map(
    (skill) => ({
      key: `bg-${skill.slug}`,
      label: skill.name,
      hint: "Antecedente",
    }),
  );

  const cantrips = values.characterSpells.filter(
    (s) => (spellLevelBySlug.get(s.spellSlug) ?? -1) === 0,
  );
  const leveledSpells = values.characterSpells.filter(
    (s) => (spellLevelBySlug.get(s.spellSlug) ?? 1) > 0,
  );

  const equipmentBySource = {
    class: values.equipment.filter((e) => e.source === "class"),
    background: values.equipment.filter((e) => e.source === "background"),
  };

  return {
    values,
    boostMode,
    plus2,
    plus1,
    plus1Slugs,
    labels,
    finalScores,
    methodLabel,
    toolLabel,
    classSkillChips,
    backgroundSkillChips,
    previewFeats,
    featNameBySlug,
    optionsByFeatInstance,
    asiLevelByFeatKey,
    originFeatSlug,
    resolveFeatOption,
    featOptionDefsFor,
    featOptionsLoading,
    equipmentBySource,
    resolvePackageLabel,
    resolveEquipmentItemName,
    speciesChoiceLabel,
    subclassOptionLabel,
    cantrips,
    leveledSpells,
    langQuota,
  };
}
