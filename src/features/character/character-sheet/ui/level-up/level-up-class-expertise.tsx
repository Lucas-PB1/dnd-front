"use client";

import { useMemo } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { ClassOption } from "@/entities/character/sheet-types";
import {
  allowedExpertiseSkillSlugsForClass,
  type ClassExpertiseSlot,
} from "@/entities/character/lib/class-expertise-slots";
import { collectProficientSkillSlugs } from "@/entities/character/lib/check-bonuses";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";

type LevelUpClassExpertiseProps = {
  character: CharacterDetail;
  newSlots: readonly ClassExpertiseSlot[];
  value: ClassOption[];
  onChange: (next: ClassOption[]) => void;
};

export function LevelUpClassExpertise({
  character,
  newSlots,
  value,
  onChange,
}: LevelUpClassExpertiseProps) {
  const allSkills = useSkills();

  const whitelist = useMemo(
    () => allowedExpertiseSkillSlugsForClass(character.classSlug),
    [character.classSlug],
  );

  const proficientSlugs = useMemo(
    () =>
      collectProficientSkillSlugs({
        classSkillSlugs: character.classSkillSlugs,
        backgroundSkillSlugs: character.backgroundSkillSlugs,
        speciesChoices: character.speciesChoices,
        featOptions: character.featOptions,
        classOptions: value,
        classSlug: character.classSlug,
        level: character.level,
      }),
    [character, value],
  );

  const skillNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const skill of allSkills.data?.data ?? []) {
      map.set(skill.slug, skill.name);
    }
    return map;
  }, [allSkills.data?.data]);

  const expertiseCandidates = useMemo(() => {
    let slugs = proficientSlugs;
    if (whitelist) {
      slugs = slugs.filter((slug) => whitelist.includes(slug));
    }
    return slugs
      .map((slug) => ({
        value: slug,
        label: skillNameBySlug.get(slug) ?? slug,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt"));
  }, [proficientSlugs, skillNameBySlug, whitelist]);

  function setExpertise(optionKey: string, valueId: string) {
    const without = value.filter((option) => option.optionKey !== optionKey);
    if (!valueId) {
      onChange(without);
      return;
    }
    onChange([...without, { optionKey, valueId }]);
  }

  if (newSlots.length === 0) return null;

  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
      <p className="font-medium">Nova Especialização</p>
      <p className="text-muted-foreground">
        Escolha perícias nas quais você já é proficiente (×2 PB).
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {newSlots.map((slot) => {
          const selected =
            value.find((option) => option.optionKey === slot.optionKey)
              ?.valueId ?? "";
          const takenElsewhere = new Set(
            value
              .filter((option) => option.optionKey !== slot.optionKey)
              .map((option) => option.valueId),
          );
          const selectOptions = expertiseCandidates.filter(
            (candidate) =>
              candidate.value === selected ||
              !takenElsewhere.has(candidate.value),
          );
          return (
            <CatalogSelect
              key={slot.optionKey}
              id={`level-up-${slot.optionKey}`}
              label={`Especialização (nv. ${slot.unlockLevel})`}
              options={selectOptions}
              value={selected}
              onChange={(event) =>
                setExpertise(slot.optionKey, event.target.value)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export function levelUpExpertiseComplete(
  newSlots: readonly ClassExpertiseSlot[],
  classOptions: ClassOption[],
): boolean {
  return newSlots.every((slot) =>
    classOptions.some(
      (option) => option.optionKey === slot.optionKey && option.valueId,
    ),
  );
}
