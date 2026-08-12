import { describe, expect, it } from "vitest";

import {
  mergeClassSpellLists,
  resolveSubclassSkillSelectOptions,
  resolveSubclassSpellSelectOptions,
} from "@/features/character/create-character/lib/subclass/resolve-subclass-option-select";

describe("mergeClassSpellLists", () => {
  it("deduplicates spells by slug", () => {
    expect(
      mergeClassSpellLists([
        [{ slug: "curar-ferimentos", name: "Curar Ferimentos", level: 1, schoolSlug: "evocacao", schoolName: "Evocação" }],
        [{ slug: "curar-ferimentos", name: "Curar Ferimentos", level: 1, schoolSlug: "evocacao", schoolName: "Evocação" }],
        [{ slug: "bencao", name: "Bênção", level: 1, schoolSlug: "encantamento", schoolName: "Encantamento" }],
      ]),
    ).toHaveLength(2);
  });
});

describe("resolveSubclassSkillSelectOptions", () => {
  it("excludes proficient and sibling lore picks", () => {
    const options = resolveSubclassSkillSelectOptions({
      optionKey: "loreBonusSkill2",
      allSkills: [
        { slug: "arcana", name: "Arcanismo" },
        { slug: "history", name: "História" },
        { slug: "insight", name: "Intuição" },
      ],
      fighterClassSkills: [],
      proficientSlugs: ["arcana"],
      subclassOptions: [{ optionKey: "loreBonusSkill1", valueId: "history" }],
      selected: "",
    });

    expect(options.map((option) => option.value)).toEqual(["insight"]);
  });

  it("limits war scholar skill to fighter pool", () => {
    const options = resolveSubclassSkillSelectOptions({
      optionKey: "warScholarSkill",
      allSkills: [{ slug: "arcana", name: "Arcanismo" }],
      fighterClassSkills: [{ slug: "athletics", name: "Atletismo" }],
      proficientSlugs: [],
      subclassOptions: [],
      selected: "",
    });

    expect(options).toEqual([{ value: "athletics", label: "Atletismo" }]);
  });
});

describe("resolveSubclassSpellSelectOptions", () => {
  const loreGroup = {
    optionKey: "magicalDiscovery1",
    label: "Descoberta Mágica 1",
    unlockLevel: 6,
    valueType: "spell",
    values: [],
    spellMaxLevel: 3,
    spellSchoolSlugs: null,
  };

  it("filters lore spells by level cap at character level 6", () => {
    const options = resolveSubclassSpellSelectOptions({
      group: loreGroup,
      level: 6,
      loreSpells: [
        { slug: "curar-ferimentos", name: "Curar Ferimentos", level: 1, schoolSlug: "evocacao", schoolName: "Evocação" },
        { slug: "reviver-mortos", name: "Reviver Mortos", level: 5, schoolSlug: "necromancia", schoolName: "Necromancia" },
      ],
      wizardSpells: [],
      subclassOptions: [],
      selected: "",
    });

    expect(options.map((option) => option.value)).toEqual(["curar-ferimentos"]);
  });

  it("filters wizard versatility by school and sibling picks", () => {
    const options = resolveSubclassSpellSelectOptions({
      group: {
        optionKey: "abjurationVersatility2",
        label: "Versado 2",
        unlockLevel: 3,
        valueType: "spell",
        values: [],
        spellMaxLevel: 2,
        spellSchoolSlugs: ["abjuracao"],
      },
      level: 3,
      loreSpells: [],
      wizardSpells: [
        { slug: "escudo-arcano", name: "Escudo Arcano", level: 1, schoolSlug: "abjuracao", schoolName: "Abjuração" },
        { slug: "bola-de-fogo", name: "Bola de Fogo", level: 3, schoolSlug: "evocacao", schoolName: "Evocação" },
      ],
      subclassOptions: [{ optionKey: "abjurationVersatility1", valueId: "escudo-arcano" }],
      selected: "",
    });

    expect(options).toEqual([]);
  });
});
