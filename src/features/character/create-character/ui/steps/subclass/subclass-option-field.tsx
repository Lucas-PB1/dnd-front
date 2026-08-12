"use client";

import type { SubclassOptionGroup } from "@/entities/class/types";
import type { ClassSpellOption } from "@/entities/class/types";
import type { SubclassOption } from "@/entities/character/sheet-types";
import {
  resolveSubclassSkillSelectOptions,
  resolveSubclassSpellSelectOptions,
} from "@/features/character/create-character/lib/subclass/resolve-subclass-option-select";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";

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
  isLoading?: boolean;
  onChange: (valueId: string) => void;
};

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
  isLoading = false,
  onChange,
}: SubclassOptionFieldProps) {
  const label = `${group.label} (nv. ${group.unlockLevel})`;

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
      <CatalogSelect
        id={`subclass-opt-${group.optionKey}`}
        label={label}
        description="Se já tiver a proficiência, escolha outra."
        options={options}
        isLoading={isLoading}
        value={selected}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (group.valueType === "spell") {
    const options = resolveSubclassSpellSelectOptions({
      group,
      level,
      loreSpells,
      wizardSpells,
      subclassOptions,
      selected,
    });
    return (
      <CatalogSelect
        id={`subclass-opt-${group.optionKey}`}
        label={label}
        options={options}
        isLoading={isLoading}
        value={selected}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <CatalogSelect
      id={`subclass-opt-${group.optionKey}`}
      label={label}
      options={group.values.map((value) => ({
        value: value.valueId,
        label: value.label,
      }))}
      value={selected}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
