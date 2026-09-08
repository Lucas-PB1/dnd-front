import { describe, expect, it } from "vitest";

import { buildWeaponMasteryCandidates } from "@/entities/character/lib/build-weapon-mastery-candidates";
import { isWeaponProficient } from "@/entities/character/lib/weapon-proficiency";

const mastery = {
  slug: "vex",
  name: "Afligir",
  description: "Vantagem no próximo ataque.",
};

function weapon(
  slug: string,
  category: string,
  propertySlugs: string[],
  name = slug,
) {
  return {
    slug,
    name,
    category,
    propertyDetails: propertySlugs.map((p) => ({
      slug: p,
      name: p,
      description: "",
    })),
    mastery,
  };
}

describe("isWeaponProficient", () => {
  it("grants martial finesse/light from armas-marciais-acuidade-ou-leves", () => {
    expect(
      isWeaponProficient(
        {
          itemSlug: "rapier",
          category: "martial",
          propertySlugs: ["finesse"],
        },
        ["armas-simples", "armas-marciais-acuidade-ou-leves"],
      ),
    ).toBe(true);
    expect(
      isWeaponProficient(
        {
          itemSlug: "longsword",
          category: "martial",
          propertySlugs: ["versatile"],
        },
        ["armas-simples", "armas-marciais-acuidade-ou-leves"],
      ),
    ).toBe(false);
  });

  it("grants martial from feat martial-weapon-training via expanded list", () => {
    expect(
      isWeaponProficient(
        {
          itemSlug: "longsword",
          category: "martial",
          propertySlugs: ["versatile"],
        },
        ["armas-simples"],
        { featSlugs: ["martial-weapon-training"] },
      ),
    ).toBe(true);
  });
});

describe("buildWeaponMasteryCandidates", () => {
  const catalog = [
    weapon("dagger", "simple", ["finesse", "light", "thrown"], "Adaga"),
    weapon("sling", "simple", ["ammunition"], "Funda"),
    weapon("shortsword", "martial", ["finesse", "light"], "Espada Curta"),
    weapon("rapier", "martial", ["finesse"], "Rapieira"),
    weapon("longsword", "martial", ["versatile"], "Espada Longa"),
    weapon("greataxe", "martial", ["heavy", "two-handed"], "Machado Grande"),
    {
      slug: "club",
      name: "Clava",
      category: "simple",
      propertyDetails: [],
      mastery: null,
    },
  ];

  it("returns empty when class proficiencies are not loaded", () => {
    expect(
      buildWeaponMasteryCandidates({
        weapons: catalog,
        weaponProficiencySlugs: [],
        eligibility: null,
      }),
    ).toEqual([]);
  });

  it("keeps only proficient weapons with mastery for rogue 2024", () => {
    const result = buildWeaponMasteryCandidates({
      weapons: catalog,
      weaponProficiencySlugs: [
        "armas-simples",
        "armas-marciais-acuidade-ou-leves",
      ],
      eligibility: null,
    });
    expect(result.map((c) => c.value)).toEqual([
      "dagger",
      "shortsword",
      "sling",
      "rapier",
    ]);
    expect(result.map((c) => c.value)).not.toContain("longsword");
    expect(result.map((c) => c.value)).not.toContain("greataxe");
    expect(result.map((c) => c.value)).not.toContain("club");
  });

  it("keeps only specific weapons for wizard-like proficiencies", () => {
    const result = buildWeaponMasteryCandidates({
      weapons: catalog,
      weaponProficiencySlugs: ["adagas", "fundas", "bordoes", "dardos", "bestas-leves"],
      eligibility: null,
    });
    expect(result.map((c) => c.value).sort()).toEqual(["dagger", "sling"]);
  });
});
