import { describe, expect, it } from "vitest";

import {
  classSpellcastingMode,
  countSpellsByType,
  filterClassSpells,
  formatSpellSlotsForLevel,
  toggleCantrip,
  toggleLeveledSpell,
} from "@/features/create-character/lib/wizard-spell-selection";
import type { ClassSpellOption } from "@/entities/class/types";

const catalog: ClassSpellOption[] = [
  {
    slug: "guidance",
    name: "Orientação",
    level: 0,
    schoolSlug: "divination",
    schoolName: "Adivinhação",
  },
  {
    slug: "light",
    name: "Luz",
    level: 0,
    schoolSlug: "evocation",
    schoolName: "Evocação",
  },
  {
    slug: "cure-wounds",
    name: "Curar Ferimentos",
    level: 1,
    schoolSlug: "evocation",
    schoolName: "Evocação",
  },
];

describe("wizard-spell-selection", () => {
  it("detects prepared casters", () => {
    expect(classSpellcastingMode("cleric")).toBe("prepared");
    expect(classSpellcastingMode("bard")).toBe("known");
    expect(classSpellcastingMode("wizard")).toBe("wizard");
  });

  it("filters by name and circle", () => {
    expect(
      filterClassSpells(catalog, { q: "curar", schoolSlug: "", circle: "" }),
    ).toHaveLength(1);
    expect(
      filterClassSpells(catalog, { q: "", schoolSlug: "", circle: "0" }),
    ).toHaveLength(2);
  });

  it("enforces cantrip quota", () => {
    const first = toggleCantrip([], catalog[0]!, catalog, 1);
    expect(first.ok).toBe(true);
    const second = toggleCantrip(
      first.ok ? first.next : [],
      catalog[1]!,
      catalog,
      1,
    );
    expect(second.ok).toBe(false);
  });

  it("counts prepared leveled spells", () => {
    const spells = [
      { spellSlug: "cure-wounds", listType: "prepared" as const },
    ];
    expect(countSpellsByType(spells, catalog).leveledPrepared).toBe(1);
  });

  it("formats spell slots", () => {
    expect(formatSpellSlotsForLevel({ "1": 2, "2": 0, "3": 1 })).toEqual([
      { level: "1", count: 2 },
      { level: "3", count: 1 },
    ]);
  });

  it("adds prepared spell for cleric", () => {
    const result = toggleLeveledSpell(
      [],
      catalog[2]!,
      catalog,
      "prepared",
      { leveledKnownMax: null, leveledPreparedMax: 4 },
      "prepared",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.next[0]?.listType).toBe("prepared");
    }
  });
});
