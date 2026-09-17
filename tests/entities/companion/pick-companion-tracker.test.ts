import { describe, expect, it } from "vitest";

import type { CompanionTracker } from "@/entities/companion/types";
import { pickCompanionTracker } from "@/entities/companion/lib/pick-companion-tracker";

const earth: CompanionTracker = {
  actorId: "a1",
  name: "Fera da Terra",
  templateSlug: "primal-companion-earth",
  hitPointsCurrent: 18,
  hitPointsMax: 20,
  armorClass: 13,
  defeated: false,
  conditions: [],
};

const sky: CompanionTracker = {
  actorId: "a2",
  name: "Fera do Céu",
  templateSlug: "primal-companion-sky",
  hitPointsCurrent: 0,
  hitPointsMax: 16,
  armorClass: 13,
  defeated: true,
  conditions: [],
};

describe("pickCompanionTracker", () => {
  it("escolhe o template da opção da ficha", () => {
    expect(
      pickCompanionTracker([earth, sky], "primal-companion-sky")?.actorId,
    ).toBe("a2");
  });

  it("cai no primeiro tracker se o template não bater", () => {
    expect(pickCompanionTracker([earth], "primal-companion-sea")?.actorId).toBe(
      "a1",
    );
  });
});
