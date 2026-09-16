import { describe, expect, it } from "vitest";

import {
  classExpertiseSlotsAtLevel,
  expertiseSlotsFromClassOptions,
  expertiseWhitelistFromClassOptions,
  hasJackOfAllTrades,
} from "@/entities/character/lib/class-expertise-slots";

const rogueOptions = [
  {
    optionKey: "expertiseSkill1",
    unlockLevel: 1,
    values: [{ valueId: "stealth" }, { valueId: "perception" }],
  },
  {
    optionKey: "expertiseSkill2",
    unlockLevel: 6,
    values: [{ valueId: "stealth" }, { valueId: "perception" }],
  },
  {
    optionKey: "other",
    unlockLevel: 1,
    values: [{ valueId: "ignore" }],
  },
];

describe("class expertise from catalog options", () => {
  it("maps expertiseSkill keys into slots", () => {
    expect(expertiseSlotsFromClassOptions(rogueOptions)).toEqual([
      { optionKey: "expertiseSkill1", unlockLevel: 1 },
      { optionKey: "expertiseSkill2", unlockLevel: 6 },
    ]);
  });

  it("filters slots by character level", () => {
    const slots = expertiseSlotsFromClassOptions(rogueOptions);
    expect(classExpertiseSlotsAtLevel(slots, 1)).toHaveLength(1);
    expect(classExpertiseSlotsAtLevel(slots, 6)).toHaveLength(2);
  });

  it("builds a whitelist from option values", () => {
    expect(expertiseWhitelistFromClassOptions(rogueOptions)).toEqual([
      "stealth",
      "perception",
    ]);
  });

  it("unlocks Jack of All Trades from catalog level", () => {
    expect(hasJackOfAllTrades(2, 1)).toBe(false);
    expect(hasJackOfAllTrades(2, 2)).toBe(true);
    expect(hasJackOfAllTrades(null, 20)).toBe(false);
  });
});
