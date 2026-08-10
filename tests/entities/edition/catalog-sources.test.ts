import { describe, expect, it } from "vitest";

import {
  editionMenuLabel,
  editionShortLabel,
  editionSlugsQueryParam,
  filterByEnabledEditions,
  isEditionAllowed,
  PHB_EDITION_SLUG,
  VALDAS_EDITION_SLUG,
} from "@/entities/edition/catalog-sources";

describe("catalog-sources helpers", () => {
  it("maps short labels", () => {
    expect(editionShortLabel(PHB_EDITION_SLUG)).toBe("PHB");
    expect(editionShortLabel(VALDAS_EDITION_SLUG)).toBe("Valdas");
    expect(editionShortLabel("dmg-2024-pt")).toBe("DMG");
    expect(editionShortLabel(null)).toBe("PHB");
  });

  it("builds query param only when subset selected", () => {
    const all = [PHB_EDITION_SLUG, VALDAS_EDITION_SLUG, "dmg-2024-pt"];
    expect(editionSlugsQueryParam(new Set(all), all)).toBeUndefined();
    expect(editionSlugsQueryParam(new Set([PHB_EDITION_SLUG]), all)).toBe(
      PHB_EDITION_SLUG,
    );
  });

  it("filters items by enabled editions", () => {
    const items = [
      { slug: "fighter", editionSlug: PHB_EDITION_SLUG },
      { slug: "gunslinger", editionSlug: VALDAS_EDITION_SLUG },
      { slug: "human", editionSlug: null },
      { slug: "adaga-peconhenta", editionSlug: "dmg-2024-pt" },
    ];
    expect(
      filterByEnabledEditions(items, new Set([PHB_EDITION_SLUG])).map(
        (item) => item.slug,
      ),
    ).toEqual(["fighter", "human"]);
    expect(
      isEditionAllowed(VALDAS_EDITION_SLUG, new Set([PHB_EDITION_SLUG])),
    ).toBe(false);
  });

  it("menu label prefers friendly names", () => {
    expect(
      editionMenuLabel({
        slug: VALDAS_EDITION_SLUG,
        label: "Valdas Spire 2024 EN",
        book: "Valdas",
      }),
    ).toBe("Valdas");
    expect(
      editionMenuLabel({
        slug: "dmg-2024-pt",
        label: "DMG 2024 PT",
        book: "DMG",
      }),
    ).toBe("DMG 2024");
  });
});
