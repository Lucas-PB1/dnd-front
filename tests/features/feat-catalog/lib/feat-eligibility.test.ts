import { describe, expect, it } from "vitest";

import { canAddCharacterFeat } from "@/entities/character/lib/character-feat";
import type { FeatSummary } from "@/entities/feat/types";
import {
  meetsFeatRequirements,
  type FeatEligibilityContext,
} from "@/features/catalog/feat-catalog/lib/feat-eligibility";

const baseFeat: FeatSummary = {
  slug: "test-feat",
  name: "Talento de teste",
  categorySlug: "general",
  categoryName: "Geral",
  categoryTypeLabel: "Talento Geral",
  repeatable: false,
  prerequisite: null,
  minimumLevel: null,
  abilityPrerequisites: [],
  requiresSpellcasting: false,
  requiredArmorTrainingSlug: null,
  requiresFightingStyle: false,
  requiresWeaponMastery: false,
  requiredFeatSlugs: [],
  requiredSkillSlugs: [],
  requiredSpeciesSlugs: [],
  requiredWeaponProficiencySlugs: [],
  requiredFeatOptions: [],
  sourceChapter: null,
  sourceChapterTitle: null,
  editionSlug: null,
  benefits: [],
};

const baseContext: FeatEligibilityContext = {
  level: 4,
  abilityScores: {
    forca: 10,
    destreza: 10,
    constituicao: 10,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 10,
  },
  hasSpellcasting: false,
  armorTrainingSlugs: [],
  hasFightingStyleFeature: false,
};

describe("meetsFeatRequirements", () => {
  it("rejeita nível abaixo do mínimo", () => {
    expect(
      meetsFeatRequirements({ ...baseFeat, minimumLevel: 5 }, baseContext),
    ).toBe(false);
  });

  it("aceita quando qualquer atributo alternativo atinge o mínimo", () => {
    const feat = {
      ...baseFeat,
      abilityPrerequisites: [
        { abilitySlug: "forca" as const, minimumScore: 13 },
        { abilitySlug: "destreza" as const, minimumScore: 13 },
      ],
    };

    expect(
      meetsFeatRequirements(feat, {
        ...baseContext,
        abilityScores: { ...baseContext.abilityScores, destreza: 13 },
      }),
    ).toBe(true);
  });

  it("exige conjuração e treinamento de armadura quando configurados", () => {
    const feat = {
      ...baseFeat,
      requiresSpellcasting: true,
      requiredArmorTrainingSlug: "medium",
    };

    expect(meetsFeatRequirements(feat, baseContext)).toBe(false);
    expect(
      meetsFeatRequirements(feat, {
        ...baseContext,
        hasSpellcasting: true,
        armorTrainingSlugs: ["medium"],
      }),
    ).toBe(true);
  });

  it("exige talentos pré-requisito já adquiridos", () => {
    const feat = {
      ...baseFeat,
      requiredFeatSlugs: ["blessing-of-baldur"],
    };

    expect(meetsFeatRequirements(feat, baseContext)).toBe(false);
    expect(
      meetsFeatRequirements(feat, {
        ...baseContext,
        ownedFeatSlugs: ["blessing-of-baldur"],
      }),
    ).toBe(true);
  });

  it("exige perícias, maestria em arma e espécie quando configurados", () => {
    const feat = {
      ...baseFeat,
      requiresWeaponMastery: true,
      requiredSkillSlugs: ["deception"],
      requiredSpeciesSlugs: ["giantkin", "trollkin"],
    };

    expect(meetsFeatRequirements(feat, baseContext)).toBe(false);
    expect(
      meetsFeatRequirements(feat, {
        ...baseContext,
        hasWeaponMasteryFeature: true,
        skillSlugs: ["deception"],
        speciesSlug: "trollkin",
      }),
    ).toBe(true);
  });

  it("exige proficiência de arma (machadinhas via armas simples)", () => {
    const feat = {
      ...baseFeat,
      requiredWeaponProficiencySlugs: ["machadinhas"],
    };

    expect(meetsFeatRequirements(feat, baseContext)).toBe(false);
    expect(
      meetsFeatRequirements(feat, {
        ...baseContext,
        weaponProficiencySlugs: ["armas-simples"],
      }),
    ).toBe(true);
  });

  it("exige opção de Adepto Elemental (tipo de dano)", () => {
    const feat = {
      ...baseFeat,
      requiredFeatSlugs: ["elemental-adept"],
      requiredFeatOptions: [
        {
          featSlug: "elemental-adept",
          optionKey: "damageType",
          valueId: "cold",
        },
      ],
    };

    expect(
      meetsFeatRequirements(feat, {
        ...baseContext,
        ownedFeatSlugs: ["elemental-adept"],
      }),
    ).toBe(false);
    expect(
      meetsFeatRequirements(feat, {
        ...baseContext,
        ownedFeatSlugs: ["elemental-adept"],
        ownedFeatOptions: [
          {
            featSlug: "elemental-adept",
            optionKey: "damageType",
            valueId: "cold",
          },
        ],
      }),
    ).toBe(true);
  });
});

describe("canAddCharacterFeat", () => {
  it("não permite novamente um talento já adquirido", () => {
    expect(
      canAddCharacterFeat(
        [{ featSlug: "magic-initiate", instanceIndex: 0 }],
        "magic-initiate",
      ),
    ).toBe(false);
  });
});
