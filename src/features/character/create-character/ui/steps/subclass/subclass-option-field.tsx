"use client";

import type { SubclassOptionGroup } from "@/entities/class/types";
import type { ClassSpellOption } from "@/entities/class/types";
import type { SubclassOption } from "@/entities/character/sheet-types";
import {
  resolveSubclassSkillSelectOptions,
  resolveSubclassSpellSelectOptions,
} from "@/features/character/create-character/lib/subclass/resolve-subclass-option-select";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import {
  ChoicePreviewPanel,
  truncateChoiceHint,
} from "@/features/character/create-character/ui/choice-preview-panel";

type SubclassOptionFieldProps = {
  group: SubclassOptionGroup;
  level: number;
  selected: string;
  subclassOptions: SubclassOption[];
  proficientSlugs: string[];
  allSkills: readonly { slug: string; name: string }[];
  fighterClassSkills: readonly { slug: string; name: string }[];
  loreSpells: readonly ClassSpellOption[];
  wizardSpells: readonly ClassSpellOption[];
  clericCantrips?: readonly ClassSpellOption[];
  /** Descrição da feature de escolha (quando value.benefit ainda é null). */
  featureFallbackText?: string | null;
  isLoading?: boolean;
  onChange: (valueId: string) => void;
};

/** Extrai o parágrafo da opção no texto da feature ("Nome. …"). */
function benefitFromFeatureText(
  featureText: string | null | undefined,
  optionLabel: string,
): string | null {
  const body = featureText?.trim();
  const label = optionLabel.trim();
  if (!body || !label) return null;

  const normalized = body.replace(/\s+/g, " ");
  const start = normalized.indexOf(`${label}.`);
  if (start < 0) return null;

  const after = normalized.slice(start + label.length + 1).trim();
  const nextOption = after.match(/\s[A-ZÀ-Ü][^.]*\.\s/);
  const end = nextOption?.index;
  const excerpt =
    end != null && end > 0 ? after.slice(0, end).trim() : after.trim();
  return excerpt || null;
}

export function SubclassOptionField({
  group,
  level,
  selected,
  subclassOptions,
  proficientSlugs,
  allSkills,
  fighterClassSkills,
  loreSpells,
  wizardSpells,
  clericCantrips = [],
  featureFallbackText,
  isLoading = false,
  onChange,
}: SubclassOptionFieldProps) {
  const label = `${group.label} (nv. ${group.unlockLevel})`;
  const selectedValue = group.values.find((value) => value.valueId === selected);
  const benefit =
    selectedValue?.benefit?.trim() ||
    benefitFromFeatureText(featureFallbackText, selectedValue?.label ?? "") ||
    null;
  const detail =
    benefit ||
    (selectedValue && featureFallbackText?.trim()
      ? featureFallbackText.trim()
      : null);

  const preview =
    selectedValue && detail ? (
      <ChoicePreviewPanel
        title={selectedValue.label}
        subtitle={group.label}
        teaser={benefit ?? detail}
        detailText={detail}
      />
    ) : null;

  if (group.valueType === "skill_list") {
    const options = resolveSubclassSkillSelectOptions({
      optionKey: group.optionKey,
      allSkills,
      fighterClassSkills,
      proficientSlugs,
      subclassOptions,
      selected,
    });
    return (
      <div className="space-y-1.5">
        <CatalogSelect
          id={`subclass-opt-${group.optionKey}`}
          label={label}
          description="Se já tiver a proficiência, escolha outra."
          options={options}
          isLoading={isLoading}
          value={selected}
          onChange={(event) => onChange(event.target.value)}
        />
        {preview}
      </div>
    );
  }

  if (group.valueType === "spell") {
    const options = resolveSubclassSpellSelectOptions({
      group,
      level,
      loreSpells,
      wizardSpells,
      clericCantrips,
      subclassOptions,
      selected,
    });
    return (
      <div className="space-y-1.5">
        <CatalogSelect
          id={`subclass-opt-${group.optionKey}`}
          label={label}
          options={options}
          isLoading={isLoading}
          value={selected}
          onChange={(event) => onChange(event.target.value)}
        />
        {preview}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <CatalogSelect
        id={`subclass-opt-${group.optionKey}`}
        label={label}
        options={group.values.map((value) => ({
          value: value.valueId,
          label: value.label,
          hint: truncateChoiceHint(
            value.benefit ??
              benefitFromFeatureText(featureFallbackText, value.label),
          ),
        }))}
        value={selected}
        onChange={(event) => onChange(event.target.value)}
      />
      {preview}
    </div>
  );
}
