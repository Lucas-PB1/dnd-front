"use client";

import { useMemo } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { SubclassOption } from "@/entities/character/sheet-types";
import { isSangromancySavantOptionKey } from "@/entities/spell/lib/sangromancy";
import {
  useSubclassMechanics,
  useSubclassOptions,
} from "@/features/catalog/class-catalog/api/use-classes";
import { useBackgroundSkills } from "@/features/catalog/background-catalog/api/use-backgrounds";
import { skillChoiceKinds } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import { useSubclassOptionCatalog } from "@/features/character/create-character/lib/subclass/use-subclass-option-catalog";
import { SubclassOptionField } from "@/features/character/create-character/ui/steps/subclass/subclass-option-field";

type SubclassOptionsEditorProps = {
  character: CharacterDetail;
  /** Nível usado para carregar defs (próximo no level-up; atual ao corrigir). */
  optionsLevel: number;
  /** Se definido, só mostra estes optionKeys. */
  optionKeys?: readonly string[];
  /**
   * Slug em draft no level-up (ainda não salvo na ficha).
   * Sem isso, opções do unlock (ex.: Coração Selvagem nv. 3) não aparecem.
   */
  subclassSlugOverride?: string;
  value: SubclassOption[];
  onChange: (next: SubclassOption[]) => void;
};

/** Editor de opções de subclasse fora do wizard (level-up / correção). */
export function SubclassOptionsEditor({
  character,
  optionsLevel,
  optionKeys,
  subclassSlugOverride,
  value,
  onChange,
}: SubclassOptionsEditorProps) {
  const subclassSlug =
    subclassSlugOverride?.trim() || character.subclassSlug || "";
  const enabled = !!subclassSlug;
  const optionsQuery = useSubclassOptions(subclassSlug, optionsLevel, enabled);
  const mechanicsQuery = useSubclassMechanics(subclassSlug, enabled);
  const backgroundSkills = useBackgroundSkills(
    character.backgroundSlug,
    enabled && !!character.backgroundSlug,
  );

  const allGroups = optionsQuery.data?.data ?? [];
  const groups = useMemo(() => {
    if (!optionKeys?.length) return allGroups;
    const allowed = new Set(optionKeys);
    return allGroups.filter((group) => allowed.has(group.optionKey));
  }, [allGroups, optionKeys]);

  const catalog = useSubclassOptionCatalog(
    groups,
    optionsLevel,
    character.classSlug,
  );

  const featureTextByOptionKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of mechanicsQuery.data?.data ?? []) {
      const key = row.optionKey?.trim();
      const text = row.featureDescription?.trim();
      if (key && text && !map.has(key)) {
        map.set(key, text);
      }
    }
    return map;
  }, [mechanicsQuery.data?.data]);

  const proficientSlugs = useMemo(() => {
    const skillKinds = skillChoiceKinds();
    const fromSpecies = character.speciesChoices
      .filter((choice) => skillKinds.has(choice.choiceKind))
      .map((choice) => choice.choiceSlug);
    const fromBackground = (backgroundSkills.data?.data ?? []).map(
      (skill) => skill.slug,
    );
    return [
      ...new Set([
        ...character.classSkillSlugs,
        ...fromBackground,
        ...fromSpecies,
      ]),
    ];
  }, [
    backgroundSkills.data?.data,
    character.classSkillSlugs,
    character.speciesChoices,
  ]);

  function setOption(optionKey: string, valueId: string) {
    const next = value.filter((option) => option.optionKey !== optionKey);
    if (valueId) {
      next.push({ optionKey, valueId });
    }
    onChange(next);
  }

  if (!enabled) return null;

  if (optionsQuery.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando opções de subclasse…
      </p>
    );
  }

  if (groups.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => {
        const selected =
          value.find((option) => option.optionKey === group.optionKey)
            ?.valueId ?? "";
        const isLoading =
          (group.valueType === "skill_list" && catalog.allSkillsLoading) ||
          (group.optionKey === "warScholarSkill" &&
            catalog.fighterSkillsLoading) ||
          (group.valueType === "spell" &&
            (group.optionKey.startsWith("magicalDiscovery")
              ? catalog.loreSpellsLoading
              : group.optionKey.startsWith("holyRevelationCantrip")
                ? catalog.clericCantripsLoading
                : isSangromancySavantOptionKey(group.optionKey)
                  ? catalog.sangromancySpellsLoading
                  : catalog.wizardSpellsLoading));

        return (
          <SubclassOptionField
            key={group.optionKey}
            group={group}
            level={optionsLevel}
            selected={selected}
            subclassOptions={value}
            proficientSlugs={proficientSlugs}
            allSkills={catalog.allSkills}
            fighterClassSkills={catalog.fighterClassSkills}
            loreSpells={catalog.loreSpells}
            wizardSpells={catalog.wizardSpells}
            clericCantrips={catalog.clericCantrips}
            sangromancySpells={catalog.sangromancySpells}
            featureFallbackText={featureTextByOptionKey.get(group.optionKey)}
            isLoading={isLoading}
            onChange={(valueId) => setOption(group.optionKey, valueId)}
          />
        );
      })}
    </div>
  );
}

export function subclassOptionsComplete(
  optionKeys: readonly string[],
  value: SubclassOption[],
): boolean {
  if (optionKeys.length === 0) return true;
  const provided = new Set(
    value.filter((option) => option.valueId).map((option) => option.optionKey),
  );
  return optionKeys.every((key) => provided.has(key));
}
