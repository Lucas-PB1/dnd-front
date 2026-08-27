"use client";

import { useEffect } from "react";

import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import { applyFeatOptionChange } from "@/features/catalog/feat-catalog/lib/apply-feat-option-change";
import { linkedCastingAsiHint } from "@/features/catalog/feat-catalog/lib/linked-casting-feats";
import { filterResilientAbilityOptionValues } from "@/features/catalog/feat-catalog/lib/resilient-feat-options";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import {
  ChoicePreviewPanel,
  truncateChoiceHint,
} from "@/features/character/create-character/ui/choice-preview-panel";

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

  useEffect(() => {
    if (selected || catalogOptions.length !== 1) return;
    onChange(
      applyFeatOptionChange(value, feat, def.optionKey, catalogOptions[0].valueId),
    );
  }, [catalogOptions, def.optionKey, feat, onChange, selected, value]);

  const selectedOption = catalogOptions.find(
    (item) => item.valueId === selected,
  );

  return (
    <div className="space-y-1.5">
      <CatalogSelect
        id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
        label={def.label}
        description={description || undefined}
        options={catalogOptions.map((item) => ({
          value: item.valueId,
          label: item.label,
          hint: truncateChoiceHint(item.benefit),
        }))}
        value={selected}
        onChange={(e) =>
          onChange(
            applyFeatOptionChange(value, feat, def.optionKey, e.target.value),
          )
        }
      />
      {selectedOption?.benefit ? (
        <ChoicePreviewPanel
          title={selectedOption.label}
          subtitle={def.label ?? undefined}
          teaser={selectedOption.benefit}
          detailText={selectedOption.benefit}
        />
      ) : null}
    </div>
  );
}
