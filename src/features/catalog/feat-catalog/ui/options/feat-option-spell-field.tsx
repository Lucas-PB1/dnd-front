"use client";

import type { ClassSpellOption } from "@/entities/class/types";
import type { CharacterFeat, FeatOption } from "@/entities/character/sheet-types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import type { SpellCatalogLabel } from "@/entities/spell/types";
import { applyFeatOptionChange } from "@/features/catalog/feat-catalog/lib/apply-feat-option-change";
import {
  resolveFeatOptionSpellLoading,
  resolveFeatOptionSpellRows,
} from "@/features/catalog/feat-catalog/lib/resolve-feat-option-spell-rows";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/ui/field";

type FeatOptionSpellFieldProps = {
  feat: CharacterFeat;
  def: FeatOptionDefinition;
  selected: string;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
  instanceOptions: FeatOption[];
  classSpellsLevel0: ClassSpellOption[];
  classSpellsLevel1: ClassSpellOption[];
  allSpells: SpellCatalogLabel[];
  classSpellsLevel0Pending: boolean;
  classSpellsLevel1Pending: boolean;
  allSpellsPending: boolean;
};

export function FeatOptionSpellField({
  feat,
  def,
  selected,
  value,
  onChange,
  instanceOptions,
  classSpellsLevel0,
  classSpellsLevel1,
  allSpells,
  classSpellsLevel0Pending,
  classSpellsLevel1Pending,
  allSpellsPending,
}: FeatOptionSpellFieldProps) {
  const dependsMet =
    !def.dependsOnOptionKey ||
    instanceOptions.some(
      (option) =>
        option.optionKey === def.dependsOnOptionKey && option.valueId,
    );

  if (!dependsMet) {
    return (
      <Field>
        <FieldLabel>{def.label}</FieldLabel>
        <FieldDescription>
          Escolha a lista de magias primeiro.
        </FieldDescription>
      </Field>
    );
  }

  const spellRows = resolveFeatOptionSpellRows({
    def,
    allSpells,
    classSpellsLevel0,
    classSpellsLevel1,
  });

  return (
    <CatalogSelect
      id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
      label={def.label}
      options={spellRows.map((spell) => ({
        value: spell.slug,
        label: spell.name,
      }))}
      isLoading={resolveFeatOptionSpellLoading({
        def,
        allSpellsPending,
        classSpellsLevel0Pending,
        classSpellsLevel1Pending,
      })}
      value={selected}
      onChange={(e) =>
        onChange(
          applyFeatOptionChange(value, feat, def.optionKey, e.target.value),
        )
      }
    />
  );
}
