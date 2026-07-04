"use client";

import { useMemo } from "react";

import type { CharacterFeat } from "@/entities/character/sheet-types";
import type { FeatOption } from "@/entities/character/sheet-types";
import { formatCharacterFeatLabel } from "@/entities/character/lib/character-feat";
import { useClassSpells } from "@/features/class-catalog/api/use-classes";
import { useFeatOptions } from "@/features/feat-catalog/api/use-feat-options";
import { useItems } from "@/features/item-catalog/api/use-items";
import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { useSkills } from "@/features/reference-catalog/api/use-reference";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";

type FeatOptionFieldsProps = {
  feat: CharacterFeat;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
};

function upsertOption(
  current: FeatOption[],
  feat: CharacterFeat,
  optionKey: string,
  valueId: string,
): FeatOption[] {
  const next = current.filter(
    (option) =>
      !(
        option.featSlug === feat.featSlug &&
        option.instanceIndex === feat.instanceIndex &&
        option.optionKey === optionKey
      ),
  );
  if (valueId) {
    next.push({
      featSlug: feat.featSlug,
      instanceIndex: feat.instanceIndex,
      optionKey,
      valueId,
    });
  }
  return next;
}

function FeatOptionFields({ feat, value, onChange }: FeatOptionFieldsProps) {
  const optionsQuery = useFeatOptions(feat.featSlug, !!feat.featSlug);
  const defs = optionsQuery.data?.data ?? [];

  const instanceOptions = value.filter(
    (option) =>
      option.featSlug === feat.featSlug &&
      option.instanceIndex === feat.instanceIndex,
  );

  const spellList = instanceOptions.find(
    (option) => option.optionKey === "spellList",
  )?.valueId;

  const classSpellsLevel0 = useClassSpells(spellList ?? "", 0, !!spellList);
  const classSpellsLevel1 = useClassSpells(spellList ?? "", 1, !!spellList);
  const allSpells = useSpells();
  const skills = useSkills();
  const tools = useItems({ itemType: "tool", limit: 200 });

  const proficiencyOptions = useMemo(() => {
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

        if (def.valueType === "catalog") {
          return (
            <Field key={def.optionKey}>
              <FieldLabel>{def.label}</FieldLabel>
              <CatalogSelect
                id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
                label={def.label}
                options={def.values.map((item) => ({
                  value: item.valueId,
                  label: item.label,
                }))}
                value={selected}
                onChange={(e) =>
                  onChange(
                    upsertOption(value, feat, def.optionKey, e.target.value),
                  )
                }
              />
            </Field>
          );
        }

        if (def.valueType === "spell") {
          const dependsMet =
            !def.dependsOnOptionKey ||
            instanceOptions.some(
              (option) =>
                option.optionKey === def.dependsOnOptionKey && option.valueId,
            );

          const spellRows = def.spellSchoolSlugs?.length
            ? (allSpells.data?.data ?? []).filter(
                (spell) =>
                  spell.level === (def.spellMaxLevel ?? 1) &&
                  def.spellSchoolSlugs?.includes(spell.schoolSlug),
              )
            : def.spellMaxLevel === 0
              ? (classSpellsLevel0.data?.data ?? [])
              : (classSpellsLevel1.data?.data ?? []);

          const loading = def.spellSchoolSlugs?.length
            ? allSpells.isPending
            : def.spellMaxLevel === 0
              ? classSpellsLevel0.isPending
              : classSpellsLevel1.isPending;

          return (
            <Field key={def.optionKey}>
              <FieldLabel>{def.label}</FieldLabel>
              {!dependsMet ? (
                <FieldDescription>
                  Escolha a lista de magias primeiro.
                </FieldDescription>
              ) : (
                <CatalogSelect
                  id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
                  label={def.label}
                  options={spellRows.map((spell) => ({
                    value: spell.slug,
                    label: spell.name,
                  }))}
                  isLoading={loading}
                  value={selected}
                  onChange={(e) =>
                    onChange(
                      upsertOption(value, feat, def.optionKey, e.target.value),
                    )
                  }
                />
              )}
            </Field>
          );
        }

        if (def.valueType === "proficiency") {
          return (
            <Field key={def.optionKey}>
              <FieldLabel>{def.label}</FieldLabel>
              <FieldDescription>Perícia ou ferramenta do PHB.</FieldDescription>
              <CatalogSelect
                id={`${feat.featSlug}-${feat.instanceIndex}-${def.optionKey}`}
                label={def.label}
                options={proficiencyOptions}
                isLoading={skills.isPending || tools.isPending}
                value={selected}
                onChange={(e) =>
                  onChange(
                    upsertOption(value, feat, def.optionKey, e.target.value),
                  )
                }
              />
            </Field>
          );
        }

        return null;
      })}
    </FieldGroup>
  );
}

export function FeatOptionsEditor({
  characterFeats,
  featNameBySlug,
  value,
  onChange,
}: {
  characterFeats: CharacterFeat[];
  featNameBySlug?: Record<string, string>;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
}) {
  if (characterFeats.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento com escolhas internas.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {characterFeats.map((feat) => (
        <div
          key={`${feat.featSlug}-${feat.instanceIndex}`}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold">
            {formatCharacterFeatLabel(
              feat,
              featNameBySlug ?? {},
              characterFeats,
            )}
          </h3>
          <FeatOptionFields feat={feat} value={value} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}
