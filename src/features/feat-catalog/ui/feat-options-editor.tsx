"use client";

import { useMemo } from "react";

import type { FeatOption } from "@/entities/character/sheet-types";
import { useClassSpells } from "@/features/class-catalog/api/use-classes";
import { useFeatOptions } from "@/features/feat-catalog/api/use-feat-options";
import { useItems } from "@/features/item-catalog/api/use-items";
import { useSkills } from "@/features/reference-catalog/api/use-reference";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";

type FeatOptionsEditorProps = {
  featSlug: string;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
};

function upsertOption(
  current: FeatOption[],
  featSlug: string,
  optionKey: string,
  valueId: string,
): FeatOption[] {
  const next = current.filter(
    (o) => !(o.featSlug === featSlug && o.optionKey === optionKey),
  );
  if (valueId) {
    next.push({ featSlug, optionKey, valueId, instanceIndex: 0 });
  }
  return next;
}

function FeatOptionFields({
  featSlug,
  value,
  onChange,
}: FeatOptionsEditorProps) {
  const optionsQuery = useFeatOptions(featSlug, !!featSlug);
  const defs = optionsQuery.data?.data ?? [];

  const spellList = value.find(
    (o) => o.featSlug === featSlug && o.optionKey === "spellList",
  )?.valueId;

  const classSpellsLevel0 = useClassSpells(spellList ?? "", 0, !!spellList);
  const classSpellsLevel1 = useClassSpells(spellList ?? "", 1, !!spellList);
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
          value.find(
            (o) => o.featSlug === featSlug && o.optionKey === def.optionKey,
          )?.valueId ?? "";

        if (def.valueType === "catalog") {
          return (
            <Field key={def.optionKey}>
              <FieldLabel>{def.label}</FieldLabel>
              <CatalogSelect
                id={`${featSlug}-${def.optionKey}`}
                label={def.label}
                options={def.values.map((v) => ({
                  value: v.valueId,
                  label: v.label,
                }))}
                value={selected}
                onChange={(e) =>
                  onChange(
                    upsertOption(
                      value,
                      featSlug,
                      def.optionKey,
                      e.target.value,
                    ),
                  )
                }
              />
            </Field>
          );
        }

        if (def.valueType === "spell") {
          const dependsMet =
            !def.dependsOnOptionKey ||
            value.some(
              (o) =>
                o.featSlug === featSlug &&
                o.optionKey === def.dependsOnOptionKey &&
                o.valueId,
            );
          const spellRows =
            def.spellMaxLevel === 0
              ? (classSpellsLevel0.data?.data ?? [])
              : (classSpellsLevel1.data?.data ?? []);
          const loading =
            def.spellMaxLevel === 0
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
                  id={`${featSlug}-${def.optionKey}`}
                  label={def.label}
                  options={spellRows.map((spell) => ({
                    value: spell.slug,
                    label: spell.name,
                  }))}
                  isLoading={loading}
                  value={selected}
                  onChange={(e) =>
                    onChange(
                      upsertOption(
                        value,
                        featSlug,
                        def.optionKey,
                        e.target.value,
                      ),
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
                id={`${featSlug}-${def.optionKey}`}
                label={def.label}
                options={proficiencyOptions}
                isLoading={skills.isPending || tools.isPending}
                value={selected}
                onChange={(e) =>
                  onChange(
                    upsertOption(
                      value,
                      featSlug,
                      def.optionKey,
                      e.target.value,
                    ),
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
  featSlugs,
  featNameBySlug,
  value,
  onChange,
}: {
  featSlugs: string[];
  featNameBySlug?: Record<string, string>;
  value: FeatOption[];
  onChange: (next: FeatOption[]) => void;
}) {
  const slugsWithOptions = featSlugs.filter(Boolean);
  if (slugsWithOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento com escolhas internas.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {slugsWithOptions.map((slug) => (
        <div key={slug} className="space-y-3">
          <h3 className="text-sm font-semibold">
            {featNameBySlug?.[slug] ?? slug}
          </h3>
          <FeatOptionFields featSlug={slug} value={value} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}
