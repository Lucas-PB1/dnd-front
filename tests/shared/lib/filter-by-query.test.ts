import { describe, expect, it } from "vitest";

import { filterByQuery } from "@/shared/lib/filter-by-query";

describe("filterByQuery", () => {
  const items = [
    { name: "Guerreiro", tag: "marcial" },
    { name: "Mago", tag: "arcano" },
  ];

  it("returns all items when query is empty", () => {
    expect(filterByQuery(items, "  ", (item) => item.name)).toEqual(items);
  });

  it("filters by case-insensitive substring", () => {
    expect(filterByQuery(items, "MAG", (item) => item.name)).toEqual([
      items[1],
    ]);
  });
});
