import { describe, expect, it } from "vitest";

import {
  filterStarryFormEconomyActions,
  filterStarryFormPanelActions,
} from "@/features/character/character-sheet/lib/combat/filter-starry-form-actions";

describe("filterStarryFormPanelActions", () => {
  const actions = [
    {
      panelKey: "a",
      slug: "starry-form-archer",
      name: "Arqueiro",
      classSlug: "druid",
      minLevel: 3,
      section: "subclass" as const,
      sortOrder: 1,
      resourceSlug: "wildShape",
    },
    {
      panelKey: "b",
      slug: "starry-form-chalice",
      name: "Taça",
      classSlug: "druid",
      minLevel: 3,
      section: "subclass" as const,
      sortOrder: 2,
      resourceSlug: "wildShape",
    },
    {
      panelKey: "c",
      slug: "starry-form-end",
      name: "Encerrar",
      classSlug: "druid",
      minLevel: 3,
      section: "subclass" as const,
      sortOrder: 3,
      resourceSlug: null,
    },
  ];

  it("shows all enter forms when inactive", () => {
    expect(
      filterStarryFormPanelActions(actions, {
        starryFormActive: false,
        stellarConstellation: null,
      }).map((action) => action.slug),
    ).toEqual(["starry-form-archer", "starry-form-chalice"]);
  });

  it("shows only active constellation and end when active", () => {
    const filtered = filterStarryFormPanelActions(actions, {
      starryFormActive: true,
      stellarConstellation: "archer",
    });
    expect(filtered.map((action) => action.slug)).toEqual([
      "starry-form-archer",
      "starry-form-end",
    ]);
    expect(filtered[0]?.resourceSlug).toBeNull();
  });
});

describe("filterStarryFormEconomyActions", () => {
  const actions = [
    {
      id: "druid-starry-form-archer",
      name: "Arqueiro",
      economy: "bonus" as const,
      minLevel: 3,
      tableAction: "starry-form-archer" as const,
      resourceSlug: "wildShape",
      alwaysSpendsResource: true,
    },
    {
      id: "druid-starry-form-chalice",
      name: "Taça",
      economy: "bonus" as const,
      minLevel: 3,
      tableAction: "starry-form-chalice" as const,
      resourceSlug: "wildShape",
      alwaysSpendsResource: true,
    },
  ];

  it("keeps only archer economy row when archer form is active", () => {
    const filtered = filterStarryFormEconomyActions(actions, {
      starryFormActive: true,
      stellarConstellation: "archer",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.tableAction).toBe("starry-form-archer");
    expect(filtered[0]?.resourceSlug).toBeUndefined();
  });
});
