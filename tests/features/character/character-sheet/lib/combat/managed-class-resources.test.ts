import { describe, expect, it } from "vitest";

import { managedClassResourceSlugs } from "@/features/character/character-sheet/lib/combat/managed-class-resources";

describe("managedClassResourceSlugs", () => {
  it("hides bardic inspiration for bard panels", () => {
    expect(managedClassResourceSlugs("bard")).toEqual([
      "bardicInspiration",
      "bardic-inspiration",
    ]);
  });

  it("returns empty for unknown or missing class", () => {
    expect(managedClassResourceSlugs(undefined)).toEqual([]);
    expect(managedClassResourceSlugs("unknown-class")).toEqual([]);
  });
});
