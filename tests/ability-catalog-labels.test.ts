import { describe, expect, it } from "vitest";

import {
  abilityLabelMap,
  abilityShortFromName,
  resolveAbilityLabel,
  sortedAbilitySlugs,
} from "@/entities/ability/lib/label-map";
import { proficiencyBonusForLevel } from "@/features/character/create-character/lib/progression/proficiency-bonus-for-level";

describe("ability label map", () => {
  const catalog = [
    { slug: "destreza", name: "Destreza", sortOrder: 2 },
    { slug: "forca", name: "Força", sortOrder: 1 },
  ];

  it("maps slug to name", () => {
    expect(abilityLabelMap(catalog)).toEqual({
      destreza: "Destreza",
      forca: "Força",
    });
  });

  it("orders by sortOrder", () => {
    expect(sortedAbilitySlugs(catalog)).toEqual(["forca", "destreza"]);
  });

  it("falls back to slug", () => {
    expect(resolveAbilityLabel({ forca: "Força" }, "carisma")).toBe("carisma");
  });

  it("shortens Portuguese names without accents", () => {
    expect(abilityShortFromName("Força")).toBe("FOR");
    expect(abilityShortFromName("Constituição")).toBe("CON");
  });
});

describe("proficiencyBonusForLevel", () => {
  const levels = [
    { level: 1, proficiencyBonus: 2 },
    { level: 5, proficiencyBonus: 3 },
    { level: 9, proficiencyBonus: 4 },
  ];

  it("reads PB from catalog", () => {
    expect(proficiencyBonusForLevel(5, levels)).toBe(3);
  });

  it("throws when level missing", () => {
    expect(() => proficiencyBonusForLevel(3, levels)).toThrow(/level 3/);
  });
});
