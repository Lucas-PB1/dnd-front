import { describe, expect, it } from "vitest";

import { shouldShowWizardSubclassStep } from "@/features/create-character/lib/wizard-subclass-step";

describe("shouldShowWizardSubclassStep", () => {
  it("is false below subclass unlock level", () => {
    expect(shouldShowWizardSubclassStep(1, "evocation", 2, true)).toBe(false);
    expect(shouldShowWizardSubclassStep(2, "evocation", 2, true)).toBe(false);
  });

  it("is false without subclass slug", () => {
    expect(shouldShowWizardSubclassStep(5, "", 2, true)).toBe(false);
  });

  it("is true while options are loading", () => {
    expect(shouldShowWizardSubclassStep(5, "evocation", 0, false)).toBe(true);
  });

  it("is false when loaded and no options", () => {
    expect(shouldShowWizardSubclassStep(5, "evocation", 0, true)).toBe(false);
  });

  it("is true when loaded with options", () => {
    expect(shouldShowWizardSubclassStep(5, "evocation", 1, true)).toBe(true);
  });
});
