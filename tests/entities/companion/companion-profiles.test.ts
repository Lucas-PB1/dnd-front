import { describe, expect, it } from "vitest";

import { resolveCompanionConfig } from "@/entities/companion/lib/companion-profiles";

describe("companion profiles (front)", () => {
  it("maps beast master sky to template slug", () => {
    expect(
      resolveCompanionConfig("beast-master", [
        { optionKey: "primalCompanion", valueId: "sky" },
      ])?.templateSlug,
    ).toBe("primal-companion-sky");
  });
});
