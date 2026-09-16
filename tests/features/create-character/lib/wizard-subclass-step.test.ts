import { describe, expect, it } from "vitest";

import { shouldShowWizardSubclassStep } from "@/features/character/create-character/lib/subclass/wizard-subclass-step";

describe("shouldShowWizardSubclassStep", () => {
  it("is false below subclass unlock level", () => {
    expect(shouldShowWizardSubclassStep(1, "evocation", 2, true, 3)).toBe(
      false,
    );
    expect(shouldShowWizardSubclassStep(2, "evocation", 2, true, 3)).toBe(
      false,
    );
  });

  it("is false without subclass slug", () => {
    expect(shouldShowWizardSubclassStep(5, "", 2, true, 3)).toBe(false);
  });

  it("is true while options are loading", () => {
    expect(shouldShowWizardSubclassStep(5, "evocation", 0, false, 3)).toBe(
      true,
    );
  });

  it("is false when loaded and no options", () => {
    expect(shouldShowWizardSubclassStep(5, "evocation", 0, true, 3)).toBe(
      false,
    );
  });

  it("is true when loaded with options", () => {
    expect(shouldShowWizardSubclassStep(5, "evocation", 1, true, 3)).toBe(
      true,
    );
  });

  it("respects a catalog unlock other than 3", () => {
    expect(shouldShowWizardSubclassStep(5, "evocation", 1, true, 10)).toBe(
      false,
    );
    expect(shouldShowWizardSubclassStep(10, "evocation", 1, true, 10)).toBe(
      true,
    );
  });
});
