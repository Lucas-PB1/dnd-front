import { describe, expect, it } from "vitest";

import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  resolveFeatOptionDisplay,
  resolveFeatOptionValueLabel,
} from "@/features/feat-catalog/lib/resolve-feat-option-label";

const defs: FeatOptionDefinition[] = [
  {
    optionKey: "spellList",
    label: "Lista de magias",
    valueType: "catalog",
    sortOrder: 1,
    dependsOnOptionKey: null,
    spellMaxLevel: null,
    spellSchoolSlugs: null,
    values: [
      { valueId: "cleric", label: "Clérigo", sortOrder: 1 },
      { valueId: "wizard", label: "Mago", sortOrder: 2 },
    ],
  },
  {
    optionKey: "cantrip1",
    label: "Truque",
    valueType: "spell",
    sortOrder: 2,
    dependsOnOptionKey: "spellList",
    spellMaxLevel: 0,
    spellSchoolSlugs: null,
    values: [],
  },
];

const ctx = {
  resolveSpell: (slug: string) => (slug === "guidance" ? "Orientação" : slug),
  resolveSkill: (slug: string) => slug,
};

describe("resolveFeatOptionValueLabel", () => {
  it("resolves catalog values by label", () => {
    expect(resolveFeatOptionValueLabel(defs[0], "cleric", ctx)).toBe("Clérigo");
  });

  it("resolves spell slugs via context", () => {
    expect(resolveFeatOptionValueLabel(defs[1], "guidance", ctx)).toBe(
      "Orientação",
    );
  });

  it("resolves ability slugs via context when values are absent", () => {
    const abilityDef: FeatOptionDefinition = {
      optionKey: "abilityIncrease",
      label: "Atributo",
      valueType: "ability",
      sortOrder: 1,
      dependsOnOptionKey: null,
      spellMaxLevel: null,
      spellSchoolSlugs: null,
      spellRitualOnly: false,
      values: [],
    };
    expect(
      resolveFeatOptionValueLabel(abilityDef, "inteligencia", {
        ...ctx,
        resolveAbility: () => "Inteligência",
      }),
    ).toBe("Inteligência");
  });

  it("resolves fighting_style via feat names", () => {
    const styleDef: FeatOptionDefinition = {
      optionKey: "fightingStyle",
      label: "Estilo",
      valueType: "fighting_style",
      sortOrder: 1,
      dependsOnOptionKey: null,
      spellMaxLevel: null,
      spellSchoolSlugs: null,
      spellRitualOnly: false,
      values: [],
    };
    expect(
      resolveFeatOptionValueLabel(styleDef, "dueling", {
        ...ctx,
        resolveFeat: () => "Duelismo",
      }),
    ).toBe("Duelismo");
  });
});

describe("resolveFeatOptionDisplay", () => {
  it("returns human-readable option and value", () => {
    expect(resolveFeatOptionDisplay(defs, "spellList", "wizard", ctx)).toEqual({
      label: "Lista de magias",
      value: "Mago",
    });
  });
});
