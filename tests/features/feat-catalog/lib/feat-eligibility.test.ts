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
});

describe("canAddCharacterFeat", () => {
  it("não oferece novamente um talento já adquirido", () => {
    expect(
      canAddCharacterFeat(
        [{ featSlug: "magic-initiate", instanceIndex: 0 }],
        "magic-initiate",
      ),
    ).toBe(false);
  });
});
