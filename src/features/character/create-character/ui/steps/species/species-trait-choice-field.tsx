"use client";

import { filterOptionsExcludingTaken } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { traitChoiceLabel } from "@/features/character/create-character/lib/species/trait-choice-label";
import {
  isGhHeritageTraitSlot,
  sortGhHeritageTraitOptions,
} from "@/features/character/create-character/lib/species/grim-hollow-heritage";
import type { SpeciesTraitChoiceGroup } from "@/features/character/create-character/lib/species/use-step-species-choices";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import {
  ChoicePreviewPanel,
  truncateChoiceHint,
} from "@/features/character/create-character/ui/choice-preview-panel";
import { PaginatedTraitChoiceList } from "@/features/character/create-character/ui/steps/species/paginated-trait-choice-list";
import { cn } from "@/shared/lib/utils";

const COMPACT_LIST_THRESHOLD = 8;

type SpeciesTraitChoiceFieldProps = {
  group: SpeciesTraitChoiceGroup;
  selected?: string;
  isSkillChoice: boolean;
  grantedSkillSlugs: string[];
  onSelect: (kind: string, slug: string) => void;
};

export function SpeciesTraitChoiceField({
  group,
  selected,
  isSkillChoice,
  grantedSkillSlugs,
  onSelect,
}: SpeciesTraitChoiceFieldProps) {
  const { kind, traitName, options } = group;
  const visibleOptions = isSkillChoice
    ? filterOptionsExcludingTaken(
        options.map((opt) => ({
          value: opt.choiceSlug,
          label: opt.choiceName,
        })),
        grantedSkillSlugs,
        selected,
      ).map((opt) => {
        const source = options.find((row) => row.choiceSlug === opt.value);
        return {
          choiceSlug: opt.value,
          choiceName: opt.label,
          level1Benefit: source?.level1Benefit ?? null,
        };
      })
    : isGhHeritageTraitSlot(kind)
      ? sortGhHeritageTraitOptions(options)
      : options;
  const isGhTraitSlot = isGhHeritageTraitSlot(kind);
  const useSelect =
    !isGhTraitSlot && visibleOptions.length > COMPACT_LIST_THRESHOLD;
  const selectedOption = options.find((opt) => opt.choiceSlug === selected);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {traitChoiceLabel(kind, traitName)}
      </p>
      {isSkillChoice && grantedSkillSlugs.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Perícias já concedidas foram removidas — escolha outra.
        </p>
      ) : null}
      {isGhTraitSlot ? (
        <PaginatedTraitChoiceList
          options={visibleOptions}
          selected={selected}
          name={`species-${kind}`}
          onSelect={(slug) => onSelect(kind, slug)}
        />
      ) : useSelect ? (
        <CatalogSelect
          id={`species-choice-${kind}`}
          label=""
          options={[
            { value: "", label: "Selecione…" },
            ...visibleOptions.map((opt) => ({
              value: opt.choiceSlug,
              label: opt.choiceName,
              hint: truncateChoiceHint(opt.level1Benefit),
            })),
          ]}
          value={selected ?? ""}
          onChange={(e) => onSelect(kind, e.target.value)}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleOptions.map((opt) => (
            <label
              key={opt.choiceSlug}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm",
                selected === opt.choiceSlug && "border-primary bg-primary/5",
              )}
            >
              <input
                type="radio"
                name={`species-${kind}`}
                checked={selected === opt.choiceSlug}
                onChange={() => onSelect(kind, opt.choiceSlug)}
                className="size-4"
              />
              {opt.choiceName}
            </label>
          ))}
        </div>
      )}
      {selectedOption?.level1Benefit ? (
        <ChoicePreviewPanel
          title={selectedOption.choiceName}
          subtitle={traitChoiceLabel(kind, traitName)}
          teaser={selectedOption.level1Benefit}
          detailText={selectedOption.level1Benefit}
        />
      ) : null}
    </div>
  );
}
