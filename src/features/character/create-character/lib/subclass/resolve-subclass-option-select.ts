import type { ClassSpellOption } from "@/entities/class/types";
import type { SubclassOptionGroup } from "@/entities/class/types";
import type { SubclassOption } from "@/entities/character/sheet-types";
import { filterOptionsExcludingTaken } from "@/features/character/create-character/lib/class-skills/granted-proficiencies";
import {
  LORE_BONUS_SKILL_KEYS,
  LORE_MAGICAL_DISCOVERY_KEYS,
  loreMagicalDiscoveryMaxLevel,
} from "@/features/character/create-character/lib/subclass/subclass-option-keys";

type SelectOption = { value: string; label: string };

export function mergeClassSpellLists(
  lists: readonly ClassSpellOption[][],
): ClassSpellOption[] {
  const bySlug = new Map<string, ClassSpellOption>();
  for (const list of lists) {
    for (const spell of list) {
      if (!bySlug.has(spell.slug)) bySlug.set(spell.slug, spell);
    }
  }
  return [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pt"),
  );
}

function siblingSubclassOptionValueIds(
  subclassOptions: readonly SubclassOption[],
  currentOptionKey: string,
  siblingKeys: Iterable<string>,
): string[] {
  const keys = new Set(siblingKeys);
  return subclassOptions
    .filter(
      (option) =>
        keys.has(option.optionKey) &&
        option.optionKey !== currentOptionKey &&
        option.valueId,
    )
    .map((option) => option.valueId);
}

export function resolveSubclassSkillSelectOptions(params: {
  optionKey: string;
  allSkills: readonly { slug: string; name: string }[];
  fighterClassSkills: readonly { slug: string; name: string }[];
  proficientSlugs: readonly string[];
  subclassOptions: readonly SubclassOption[];
  selected: string;
}): SelectOption[] {
  const {
    optionKey,
    allSkills,
    fighterClassSkills,
    proficientSlugs,
    subclassOptions,
    selected,
  } = params;

  const candidates: SelectOption[] =
    optionKey === "warScholarSkill"
      ? fighterClassSkills.map((skill) => ({
          value: skill.slug,
          label: skill.name,
        }))
      : allSkills.map((skill) => ({
          value: skill.slug,
          label: skill.name,
        }));

  const siblingKeys =
    optionKey === "warScholarSkill"
      ? ["warScholarSkill"]
      : LORE_BONUS_SKILL_KEYS;

  const siblingTaken = siblingSubclassOptionValueIds(
    subclassOptions,
    optionKey,
    siblingKeys,
  );

  return filterOptionsExcludingTaken(
    candidates,
    [...proficientSlugs, ...siblingTaken],
    selected,
  );
}

export function resolveSubclassSpellSelectOptions(params: {
  group: SubclassOptionGroup;
  level: number;
  loreSpells: readonly ClassSpellOption[];
  wizardSpells: readonly ClassSpellOption[];
  subclassOptions: readonly SubclassOption[];
  selected: string;
}): SelectOption[] {
  const { group, level, loreSpells, wizardSpells, subclassOptions, selected } =
    params;

  if (LORE_MAGICAL_DISCOVERY_KEYS.has(group.optionKey)) {
    const maxLevel = loreMagicalDiscoveryMaxLevel(level);
    const spells = loreSpells.filter(
      (spell) => spell.level >= 1 && spell.level <= maxLevel,
    );
    const siblingTaken = siblingSubclassOptionValueIds(
      subclassOptions,
      group.optionKey,
      LORE_MAGICAL_DISCOVERY_KEYS,
    );
    return filterOptionsExcludingTaken(
      spells.map((spell) => ({ value: spell.slug, label: spell.name })),
      siblingTaken,
      selected,
    );
  }

  const maxLevel = group.spellMaxLevel ?? 2;
  const schools = new Set(group.spellSchoolSlugs ?? []);
  const spells = wizardSpells.filter(
    (spell) =>
      spell.level >= 1 &&
      spell.level <= maxLevel &&
      schools.has(spell.schoolSlug),
  );
  const prefix = group.optionKey.replace(/\d+$/, "");
  const siblingTaken = siblingSubclassOptionValueIds(
    subclassOptions,
    group.optionKey,
    [`${prefix}1`, `${prefix}2`],
  );
  return filterOptionsExcludingTaken(
    spells.map((spell) => ({ value: spell.slug, label: spell.name })),
    siblingTaken,
    selected,
  );
}

export function resolveSubclassOptionValueLabel(
  group: SubclassOptionGroup | undefined,
  valueId: string,
  resolveSkill: (slug: string) => string,
  resolveSpell: (slug: string) => string,
): string {
  const staticLabel = group?.values.find((value) => value.valueId === valueId)
    ?.label;
  if (staticLabel) return staticLabel;
  if (group?.valueType === "skill_list") return resolveSkill(valueId);
  if (group?.valueType === "spell") return resolveSpell(valueId);
  return valueId;
}
