"use client";

import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  filterOptionsExcludingTaken,
  siblingFeatOptionValueIds,
} from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { applyFeatOptionChange } from "@/features/catalog/feat-catalog/lib/apply-feat-option-change";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";

type CatalogOption = {
  value: string;
  label: string;
};

type FeatOptionProficiencyFieldProps = {
  feat: CharacterFeat;
  def: FeatOptionDefinition;
  selected: string;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
  catalogProficiencyOptions: CatalogOption[];
  grantedProficiencySlugs: string[];
  catalogLoading: boolean;
};

export function FeatOptionProficiencyField({
  feat,
  def,
  selected,
  value,
  onChange,
  catalogProficiencyOptions,
  grantedProficiencySlugs,
  catalogLoading,
}: FeatOptionProficiencyFieldProps) {
  const whitelist = def.values?.length
    ? def.values.map((item) => ({
        value: item.valueId,
        label: item.label,
      }))
    : catalogProficiencyOptions;
  const siblingTaken = siblingFeatOptionValueIds(
    value,
    feat.featSlug,
    feat.instanceIndex,
    def.optionKey,
  );
  const options = filterOptionsExcludingTaken(
    whitelist,
    [...grantedProficiencySlugs, ...siblingTaken],
    selected,
  );

  return (
    <CatalogSelect
      id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
      label={def.label}
      description="Se já tiver a proficiência, escolha outra."
      options={options}
      isLoading={!def.values?.length && catalogLoading}
      value={selected}
      onChange={(e) =>
        onChange(
          applyFeatOptionChange(value, feat, def.optionKey, e.target.value),
        )
      }
    />
  );
}
