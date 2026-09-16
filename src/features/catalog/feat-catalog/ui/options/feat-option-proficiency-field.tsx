import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  filterOptionsExcludingTaken,
  siblingFeatOptionValueIds,
} from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { applyFeatOptionChange } from "@/features/catalog/feat-catalog/lib/apply-feat-option-change";
import { resolveFeatProficiencyOptions } from "@/features/catalog/feat-catalog/lib/resolve-feat-proficiency-options";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import type { ToolPoolsCatalog } from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";

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
  toolCatalog?: ToolPoolsCatalog;
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
  toolCatalog,
}: FeatOptionProficiencyFieldProps) {
  const whitelist = resolveFeatProficiencyOptions(
    def,
    catalogProficiencyOptions,
    toolCatalog,
  );
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
  const usesApiWhitelist = (def.values?.length ?? 0) > 0;

  return (
    <CatalogSelect
      id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
      label={def.label}
      description="Se já tiver a proficiência, escolha outra."
      options={options}
      isLoading={!usesApiWhitelist && catalogLoading && options.length === 0}
      value={selected}
      onChange={(e) =>
        onChange(
          applyFeatOptionChange(value, feat, def.optionKey, e.target.value),
        )
      }
    />
  );
}
