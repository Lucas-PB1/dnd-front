"use client";

import { useMemo } from "react";

import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import { requiredFeatOptionDefsForInstance } from "@/features/create-character/lib/feats/feat-option-requirements";
import { proficiencyBonusForLevel } from "@/features/create-character/lib/progression/proficiency-bonus-for-level";
import { visibleFeatOptionDefs } from "@/features/feat-catalog/lib/linked-casting-feats";
import { useClassDetail, useClassSpells } from "@/features/class-catalog/api/use-classes";
import { useFeatOptions } from "@/features/feat-catalog/api/use-feat-options";
import { FeatOptionCatalogField } from "@/features/feat-catalog/ui/options/feat-option-catalog-field";
import { FeatOptionProficiencyField } from "@/features/feat-catalog/ui/options/feat-option-proficiency-field";
import { FeatOptionSpellField } from "@/features/feat-catalog/ui/options/feat-option-spell-field";
import { useItems } from "@/features/item-catalog/api/use-items";
import { useSkills } from "@/features/reference-catalog/api/use-reference";
import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { FieldGroup } from "@/shared/ui/field";

export type FeatOptionFieldsProps = {
  feat: CharacterFeat;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
  characterLevel: number;
  classSlug?: string;
  grantedSkillSlugs?: string[];
  grantedToolSlugs?: string[];
};

export function FeatOptionFields({
  feat,
  value,
  onChange,
  characterLevel,
  classSlug = "",
  grantedSkillSlugs = [],
  grantedToolSlugs = [],
}: FeatOptionFieldsProps) {
  const optionsQuery = useFeatOptions(feat.featSlug, !!feat.featSlug);
  const classDetail = useClassDetail(classSlug, !!classSlug);
  const classSavingThrowSlugs = classDetail.data?.savingThrowSlugs ?? [];
  const allDefs = optionsQuery.data?.data ?? [];
  const proficiencyBonus = proficiencyBonusForLevel(characterLevel);

  const instanceOptions = value.filter(
    (option) =>
      option.featSlug === feat.featSlug &&
      option.instanceIndex === feat.instanceIndex,
  );

  const defs = useMemo(() => {
    const required = requiredFeatOptionDefsForInstance(
      feat.featSlug,
      allDefs,
      proficiencyBonus,
      instanceOptions,
    );
    return visibleFeatOptionDefs(feat.featSlug, required);
  }, [allDefs, feat.featSlug, proficiencyBonus, instanceOptions]);

  const spellList = instanceOptions.find(
    (option) => option.optionKey === "spellList",
  )?.valueId;

  const classSpellsLevel0 = useClassSpells(spellList ?? "", 0, !!spellList);
  const classSpellsLevel1 = useClassSpells(spellList ?? "", 1, !!spellList);
  const allSpells = useSpells();
  const skills = useSkills();
  const tools = useItems({ itemType: "tool", limit: 200 });

  const catalogProficiencyOptions = useMemo(() => {
    const skillOpts = (skills.data?.data ?? []).map((skill) => ({
      value: skill.slug,
      label: skill.name,
    }));
    const toolOpts = (tools.data?.data ?? []).map((item) => ({
      value: item.slug,
      label: item.name,
    }));
    return [...skillOpts, ...toolOpts].sort((a, b) =>
      a.label.localeCompare(b.label, "pt"),
    );
  }, [skills.data?.data, tools.data?.data]);

  const grantedProficiencySlugs = useMemo(
    () => [...grantedSkillSlugs, ...grantedToolSlugs],
    [grantedSkillSlugs, grantedToolSlugs],
  );

  if (optionsQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando opções…</p>;
  }

  if (defs.length === 0) {
    return null;
  }

  return (
    <FieldGroup>
      {defs.map((def) => {
        const selected =
          instanceOptions.find((option) => option.optionKey === def.optionKey)
            ?.valueId ?? "";

        if (def.valueType === "catalog" || def.valueType === "ability") {
          return (
            <FeatOptionCatalogField
              key={def.optionKey}
              feat={feat}
              def={def}
              selected={selected}
              value={value}
              onChange={onChange}
              classSavingThrowSlugs={classSavingThrowSlugs}
            />
          );
        }

        if (def.valueType === "spell") {
          return (
            <FeatOptionSpellField
              key={def.optionKey}
              feat={feat}
              def={def}
              selected={selected}
              value={value}
              onChange={onChange}
              instanceOptions={instanceOptions}
              classSpellsLevel0={classSpellsLevel0.data?.data ?? []}
              classSpellsLevel1={classSpellsLevel1.data?.data ?? []}
              allSpells={allSpells.data?.data ?? []}
              classSpellsLevel0Pending={classSpellsLevel0.isPending}
              classSpellsLevel1Pending={classSpellsLevel1.isPending}
              allSpellsPending={allSpells.isPending}
            />
          );
        }

        if (def.valueType === "proficiency") {
          return (
            <FeatOptionProficiencyField
              key={def.optionKey}
              feat={feat}
              def={def}
              selected={selected}
              value={value}
              onChange={onChange}
              catalogProficiencyOptions={catalogProficiencyOptions}
              grantedProficiencySlugs={grantedProficiencySlugs}
              catalogLoading={skills.isPending || tools.isPending}
            />
          );
        }

        return null;
      })}
    </FieldGroup>
  );
}
