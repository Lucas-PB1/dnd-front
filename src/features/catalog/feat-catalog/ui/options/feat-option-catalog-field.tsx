"use client";

import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import { applyFeatOptionChange } from "@/features/catalog/feat-catalog/lib/apply-feat-option-change";
import { linkedCastingAsiHint } from "@/features/catalog/feat-catalog/lib/linked-casting-feats";
import { filterResilientAbilityOptionValues } from "@/features/catalog/feat-catalog/lib/resilient-feat-options";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";

type FeatOptionCatalogFieldProps = {
  feat: CharacterFeat;
  def: FeatOptionDefinition;
  selected: string;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
  classSavingThrowSlugs: string[];
};

export function FeatOptionCatalogField({
  feat,
  def,
  selected,
  value,
  onChange,
  classSavingThrowSlugs,
}: FeatOptionCatalogFieldProps) {
  const asiHint =
    def.optionKey === "abilityIncrease"
      ? linkedCastingAsiHint(feat.featSlug)
      : null;
  const resilientHint =
    feat.featSlug === "resilient" && def.optionKey === "abilityIncrease"
      ? "Escolha um atributo em que você ainda não tem proficiência em salvaguarda (da classe)."
      : null;
  const description = [asiHint, resilientHint].filter(Boolean).join(" ");
  const catalogOptions = filterResilientAbilityOptionValues(
    feat.featSlug,
    def.values,
    classSavingThrowSlugs,
  );

  return (
    <CatalogSelect
      id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
      label={def.label}
      description={description || undefined}
      options={catalogOptions.map((item) => ({
        value: item.valueId,
        label: item.label,
      }))}
      value={selected}
      onChange={(e) =>
        onChange(
          applyFeatOptionChange(value, feat, def.optionKey, e.target.value),
        )
      }
    />
  );
}
