import {
  editionMenuLabel,
  editionShortLabel,
  editionSlugsQueryParam,
  filterByEnabledEditions,
  isEditionAllowed,
  PHB_EDITION_SLUG,
  VALDA_EDITION_SLUG,
} from "@/entities/edition/catalog-sources";

describe("catalog-sources helpers", () => {
  it("maps short labels", () => {
    expect(editionShortLabel(PHB_EDITION_SLUG)).toBe("PHB");
    expect(editionShortLabel(VALDA_EDITION_SLUG)).toBe("Valda");
    expect(editionShortLabel(null)).toBe("PHB");
  });

  it("builds query param only when subset selected", () => {
    const all = [PHB_EDITION_SLUG, VALDA_EDITION_SLUG];
    expect(
      editionSlugsQueryParam(new Set(all), all),
    ).toBeUndefined();
    expect(
      editionSlugsQueryParam(new Set([PHB_EDITION_SLUG]), all),
    ).toBe(PHB_EDITION_SLUG);
  });

  it("filters items by enabled editions", () => {
    const items = [
      { slug: "fighter", editionSlug: PHB_EDITION_SLUG },
      { slug: "gunslinger", editionSlug: VALDA_EDITION_SLUG },
      { slug: "human", editionSlug: null },
    ];
    expect(
      filterByEnabledEditions(items, new Set([PHB_EDITION_SLUG])).map(
        (item) => item.slug,
      ),
    ).toEqual(["fighter", "human"]);
    expect(isEditionAllowed(VALDA_EDITION_SLUG, new Set([PHB_EDITION_SLUG]))).toBe(
      false,
    );
  });

  it("menu label prefers friendly names", () => {
    expect(
      editionMenuLabel({
        slug: VALDA_EDITION_SLUG,
        label: "Valda Spire 2024 EN",
        book: "Valda",
      }),
    ).toBe("Valda");
  });
});
