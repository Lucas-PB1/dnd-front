import { describe, expect, it } from "vitest";

import {
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
    const result = previewBackgroundAbilityBoosts(base, "sabedoria", "carisma");
    expect(result.sabedoria).toBe(12);
    expect(result.carisma).toBe(9);
    expect(result.forca).toBe(15);
  });

  it("strip reverses boosts on final scores", () => {
    const final = previewBackgroundAbilityBoosts(base, "sabedoria", "carisma");
    const stripped = stripBackgroundAbilityBoosts(
      final,
      "sabedoria",
      "carisma",
    );
    expect(stripped).toEqual(base);
  });

  it("strip returns copy when boosts are missing", () => {
    const stripped = stripBackgroundAbilityBoosts(base, null, null);
    expect(stripped).toEqual(base);
    expect(stripped).not.toBe(base);
  });
});
