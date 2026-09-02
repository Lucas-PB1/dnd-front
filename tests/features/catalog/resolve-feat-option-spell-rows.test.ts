import { describe, expect, it } from "vitest";

import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  isOpenSpellFeatOption,
  resolveFeatOptionSpellLoading,
  resolveFeatOptionSpellRows,
} from "@/features/catalog/feat-catalog/lib/resolve-feat-option-spell-rows";

function spellDef(
  partial: Partial<FeatOptionDefinition> = {},
): FeatOptionDefinition {
  return {
    optionKey: "bonusSpell",
    label: "Magia",
    valueType: "spell",
    sortOrder: 1,
    dependsOnOptionKey: null,
    spellMaxLevel: 1,
    spellSchoolSlugs: null,
    spellRitualOnly: false,
    values: [],
    ...partial,
  };
}

describe("resolveFeatOptionSpellRows", () => {
  const allSpells = [
    {
      slug: "raio-de-fogo",
      name: "Raio de Fogo",
      level: 0,
      schoolSlug: "evocacao",
      schoolName: "Evocação",
      ritual: false,
    },
    {
      slug: "alarme",
      name: "Alarme",
      level: 1,
      schoolSlug: "abjuracao",
      schoolName: "Abjuração",
      ritual: true,
    },
    {
      slug: "bola-de-fogo",
      name: "Bola de Fogo",
      level: 3,
      schoolSlug: "evocacao",
      schoolName: "Evocação",
      ritual: false,
    },
  ];

  it("detects open spell picks (Blessing of Wotan)", () => {
    expect(isOpenSpellFeatOption(spellDef())).toBe(true);
    expect(
      isOpenSpellFeatOption(spellDef({ dependsOnOptionKey: "spellList" })),
    ).toBe(false);
  });

  it("lists any exact-level spell from global catalog when open", () => {
    const rows = resolveFeatOptionSpellRows({
      def: spellDef({ spellMaxLevel: 1 }),
      allSpells,
      classSpellsLevel0: [],
      classSpellsLevel1: [],
    });
    expect(rows.map((spell) => spell.slug)).toEqual(["alarme"]);
  });

  it("uses allSpellsPending for open picks (avoids stuck class-list query)", () => {
    expect(
      resolveFeatOptionSpellLoading({
        def: spellDef(),
        allSpellsPending: false,
        classSpellsLevel0Pending: true,
        classSpellsLevel1Pending: true,
      }),
    ).toBe(false);
  });

  it("still uses class list when depends on spellList", () => {
    const rows = resolveFeatOptionSpellRows({
      def: spellDef({
        dependsOnOptionKey: "spellList",
        spellMaxLevel: 1,
      }),
      allSpells,
      classSpellsLevel0: [],
      classSpellsLevel1: [
        {
          slug: "bencao",
          name: "Bênção",
          level: 1,
          schoolSlug: "encantamento",
          schoolName: "Encantamento",
        },
      ],
    });
    expect(rows.map((spell) => spell.slug)).toEqual(["bencao"]);
  });
});
