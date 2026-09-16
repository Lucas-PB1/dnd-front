import { describe, expect, it } from "vitest";

import {
  formatXpThreshold,
  xpThresholdForLevel,
} from "@/entities/character-level/xp-threshold-for-level";

describe("xpThresholdForLevel", () => {
  const catalog = [
    { level: 1, xpThreshold: 0 },
    { level: 2, xpThreshold: 300 },
    { level: 5, xpThreshold: null },
  ];

  it("reads the catalog threshold for the level", () => {
    expect(xpThresholdForLevel(2, catalog)).toBe(300);
    expect(xpThresholdForLevel(1, catalog)).toBe(0);
  });

  it("returns null when the level or threshold is missing", () => {
    expect(xpThresholdForLevel(5, catalog)).toBeNull();
    expect(xpThresholdForLevel(9, catalog)).toBeNull();
  });
});

describe("formatXpThreshold", () => {
  it("formats with pt-BR grouping", () => {
    expect(formatXpThreshold(6500)).toBe("6.500 XP");
    expect(formatXpThreshold(0)).toBe("0 XP");
  });
});
