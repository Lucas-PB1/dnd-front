import { describe, expect, it } from "vitest";

import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
  BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
  previewBackgroundAbilityBoosts,
  stripBackgroundAbilityBoosts,
} from "@/entities/character/lib/background-boost";

const base = {
  forca: 15,
  destreza: 14,
  constituicao: 13,
  inteligencia: 12,
  sabedoria: 10,
  carisma: 8,
};

describe("background ability boosts", () => {
  it("preview applies +2 and +1", () => {
    const result = previewBackgroundAbilityBoosts(base, {
      mode: BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
      plus2Slug: "sabedoria",
      plus1Slug: "carisma",
    });
    expect(result.sabedoria).toBe(12);
    expect(result.carisma).toBe(9);
    expect(result.forca).toBe(15);
  });

  it("preview applies +1 to three abilities", () => {
    const result = previewBackgroundAbilityBoosts(base, {
      mode: BACKGROUND_BOOST_MODE_PLUS1X3,
      plus1Slugs: ["sabedoria", "carisma", "inteligencia"],
    });
    expect(result.sabedoria).toBe(11);
    expect(result.carisma).toBe(9);
    expect(result.inteligencia).toBe(13);
  });

  it("strip reverses +2/+1 boosts on final scores", () => {
    const final = previewBackgroundAbilityBoosts(base, {
      mode: BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
      plus2Slug: "sabedoria",
      plus1Slug: "carisma",
    });
    const stripped = stripBackgroundAbilityBoosts(final, {
      mode: BACKGROUND_BOOST_MODE_PLUS2_PLUS1,
      plus2Slug: "sabedoria",
      plus1Slug: "carisma",
    });
    expect(stripped).toEqual(base);
  });

  it("strip reverses +1×3 boosts on final scores", () => {
    const final = previewBackgroundAbilityBoosts(base, {
      mode: BACKGROUND_BOOST_MODE_PLUS1X3,
      plus1Slugs: ["sabedoria", "carisma", "inteligencia"],
    });
    const stripped = stripBackgroundAbilityBoosts(final, {
      mode: BACKGROUND_BOOST_MODE_PLUS1X3,
      plus1Slugs: ["sabedoria", "carisma", "inteligencia"],
    });
    expect(stripped).toEqual(base);
  });

  it("strip returns copy when boosts are missing", () => {
    const stripped = stripBackgroundAbilityBoosts(base, {
      plus2Slug: null,
      plus1Slug: null,
    });
    expect(stripped).toEqual(base);
    expect(stripped).not.toBe(base);
  });
});
