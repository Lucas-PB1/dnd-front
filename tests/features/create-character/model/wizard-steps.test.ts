import { describe, expect, it } from "vitest";

import {
  computeWizardHasSpellStep,
  wizardMaxSpellLevelForLevel,
} from "@/features/create-character/lib/wizard-spell-step";
import {
  nextWizardStep,
  prevWizardStep,
  visibleWizardSteps,
} from "@/features/create-character/model/wizard-steps";

describe("wizardMaxSpellLevelForLevel", () => {
  it("returns circle 1 at level 1 and scales with level", () => {
    expect(wizardMaxSpellLevelForLevel(1)).toBe(1);
    expect(wizardMaxSpellLevelForLevel(5)).toBe(3);
    expect(wizardMaxSpellLevelForLevel(20)).toBe(9);
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
});

describe("wizard step navigation", () => {
  it("skips spells, feats and subclass when configured", () => {
    const nav = { skipSpells: true, skipFeats: true, skipSubclass: true };
    expect(visibleWizardSteps(nav).map((step) => step.id)).not.toContain(
      "spells",
    );
    expect(visibleWizardSteps(nav).map((step) => step.id)).not.toContain(
      "feats",
    );
    expect(visibleWizardSteps(nav).map((step) => step.id)).not.toContain(
      "subclass",
    );
    expect(nextWizardStep("equipment", nav)).toBe("languages");
    expect(nextWizardStep("species", nav)).toBe("equipment");
    expect(prevWizardStep("species", nav)).toBe("background");
  });

  it("keeps spells for casters", () => {
    expect(nextWizardStep("equipment")).toBe("spells");
    expect(prevWizardStep("languages")).toBe("spells");
  });
});
