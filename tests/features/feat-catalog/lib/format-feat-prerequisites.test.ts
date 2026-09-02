import { describe, expect, it } from "vitest";

import type { FeatSummary } from "@/entities/feat/types";
import {
  formatFeatPrerequisiteTeaser,
  formatFeatStructuredPrerequisites,
  hasStructuredFeatPrerequisites,
} from "@/features/catalog/feat-catalog/lib/format-feat-prerequisites";

type FeatPrerequisiteInput = Pick<
  FeatSummary,
  | "slug"
  | "minimumLevel"
  | "abilityPrerequisites"
  | "requiresSpellcasting"
  | "requiredArmorTrainingSlug"
  | "requiresFightingStyle"
  | "requiresWeaponMastery"
  | "requiredFeatSlugs"
  | "requiredSkillSlugs"
  | "requiredSpeciesSlugs"
  | "requiredWeaponProficiencySlugs"
  | "requiredFeatOptions"
>;

const baseFeat: FeatPrerequisiteInput = {
  slug: "shadowsteel-master",
  minimumLevel: 4,
  abilityPrerequisites: [],
  requiresSpellcasting: true,
  requiredArmorTrainingSlug: null,
  requiresFightingStyle: false,
  requiresWeaponMastery: false,
  requiredFeatSlugs: ["shadowsteel-adept"],
  requiredSkillSlugs: [],
  requiredSpeciesSlugs: [],
  requiredWeaponProficiencySlugs: [],
  requiredFeatOptions: [],
};

describe("formatFeatStructuredPrerequisites", () => {
  it("formata nível, conjuração e cadeia de talento", () => {
    expect(formatFeatStructuredPrerequisites(baseFeat)).toEqual([
      "Nível 4+",
      "Conjuração ou Magia do Pacto",
    ]);
    expect(hasStructuredFeatPrerequisites(baseFeat)).toBe(true);
  });

  it("formata atributos alternativos", () => {
    const lines = formatFeatStructuredPrerequisites({
      ...baseFeat,
      slug: "hulking-figure",
      requiresSpellcasting: false,
      requiredFeatSlugs: [],
      abilityPrerequisites: [
        { abilitySlug: "forca", minimumScore: 13 },
        { abilitySlug: "destreza", minimumScore: 13 },
      ],
    });
    expect(lines).toContain("Um destes atributos: Força 13+ ou Destreza 13+");
  });

  it("usa texto livre no teaser quando não há estruturado", () => {
    const teaser = formatFeatPrerequisiteTeaser({
      ...baseFeat,
      minimumLevel: null,
      requiresSpellcasting: false,
      requiredFeatSlugs: [],
      prerequisite: "Nível 4+, Constituição 13+",
    });
    expect(teaser).toBe("Nível 4+, Constituição 13+");
  });

  it("prioriza estruturado no teaser", () => {
    const teaser = formatFeatPrerequisiteTeaser({
      ...baseFeat,
      prerequisite: "Level 4+",
    });
    expect(teaser).toContain("Nível 4+");
    expect(teaser).toContain("Conjuração ou Magia do Pacto");
  });
});
