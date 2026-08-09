import { describe, expect, it } from "vitest";

import {
  computeWizardHasSpellStep,
  maxSpellLevelFromSlots,
} from "@/features/character/create-character/lib/spells/wizard-spell-step";
import {
  nextWizardStep,
  prevWizardStep,
  skippedWizardSteps,
  visibleWizardSteps,
} from "@/features/character/create-character/model/wizard-steps";

describe("maxSpellLevelFromSlots", () => {
  it("caps half-caster ranger level 5 at circle 2", () => {
    expect(maxSpellLevelFromSlots({ "1": 4, "2": 2 })).toBe(2);
  });

  it("allows full-caster level 5 up to circle 3", () => {
    expect(maxSpellLevelFromSlots({ "1": 4, "2": 3, "3": 2 })).toBe(3);
  });
});

describe("computeWizardHasSpellStep", () => {
  it("is false for non-casters", () => {
    expect(
      computeWizardHasSpellStep({
        classSpellSlotCount: 0,
        classSpellCount: 0,
        subclassSpellCount: 0,
      }),
    ).toBe(false);
  });

  it("is true when class has spell slots", () => {
    expect(
      computeWizardHasSpellStep({
        classSpellSlotCount: 1,
        classSpellCount: 0,
        subclassSpellCount: 0,
      }),
    ).toBe(true);
  });

  it("is true when subclass has spell slots (Spellslinger)", () => {
    expect(
      computeWizardHasSpellStep({
        classSpellSlotCount: 0,
        classSpellCount: 0,
        subclassSpellCount: 0,
        subclassSpellSlotCount: 18,
      }),
    ).toBe(true);
  });
});

describe("wizard step navigation", () => {
  it("skips spells, feats, subclass and invocations when configured", () => {
    const nav = {
      skipSpells: true,
      skipFeats: true,
      skipSubclass: true,
      skipInvocations: true,
    };
    expect(visibleWizardSteps(nav).map((step) => step.id)).not.toContain(
      "spells",
    );
    expect(visibleWizardSteps(nav).map((step) => step.id)).not.toContain(
      "feats",
    );
    expect(visibleWizardSteps(nav).map((step) => step.id)).not.toContain(
      "subclass",
    );
    expect(visibleWizardSteps(nav).map((step) => step.id)).not.toContain(
      "invocations",
    );
    expect(skippedWizardSteps(nav).map((step) => step.id)).toEqual([
      "feats",
      "subclass",
      "spells",
      "invocations",
    ]);
    expect(nextWizardStep("equipment", nav)).toBe("languages");
    expect(nextWizardStep("species", nav)).toBe("equipment");
    expect(prevWizardStep("species", nav)).toBe("background");
  });

  it("keeps spells then invocations for casters", () => {
    expect(nextWizardStep("equipment")).toBe("spells");
    expect(nextWizardStep("spells")).toBe("invocations");
    expect(prevWizardStep("languages")).toBe("invocations");
  });
});
