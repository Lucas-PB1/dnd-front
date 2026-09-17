import { describe, expect, it } from "vitest";

import type { ClassEconomyActionRecord } from "@/entities/combat-mechanical/types";
import {
  filterEconomyActionsByOwner,
  sortEconomyActionsForCatalog,
} from "@/entities/combat-mechanical/lib/filter-economy-actions-by-owner";

function action(
  overrides: Partial<ClassEconomyActionRecord> & Pick<ClassEconomyActionRecord, "id" | "name">,
): ClassEconomyActionRecord {
  return {
    economy: "action",
    minLevel: 1,
    ...overrides,
  };
}

const catalog: ClassEconomyActionRecord[] = [
  action({
    id: "fighter-a",
    name: "Recuperar Fôlego",
    classSlug: "fighter",
    minLevel: 1,
  }),
  action({
    id: "species-a",
    name: "Sopro",
    speciesSlug: "dwarf",
    minLevel: 1,
  }),
  action({
    id: "champion-a",
    name: "Atleta Extraordinário",
    classSlug: "fighter",
    subclassSlug: "champion",
    minLevel: 3,
  }),
  action({
    id: "lucky-a",
    name: "Sorte",
    featSlug: "lucky",
    minLevel: 1,
  }),
  action({
    id: "potion-a",
    name: "Beber poção",
    itemSlug: "potion-of-healing",
    minLevel: 1,
    economy: "bonus",
  }),
  action({
    id: "thread-a",
    name: "Marca da Maldição",
    threadSlug: "cursemarked",
    minLevel: 1,
  }),
  action({
    id: "heritage-a",
    name: "Sopro Potente",
    heritageTraitSlug: "potent-breath",
    minLevel: 1,
  }),
];

describe("filterEconomyActionsByOwner", () => {
  it("keeps class-owned rows and drops species or item without that class", () => {
    expect(
      filterEconomyActionsByOwner(catalog, { classSlug: "fighter" }).map(
        (row) => row.id,
      ),
    ).toEqual(["fighter-a", "champion-a"]);
  });

  it("keeps only the subclass owner", () => {
    expect(
      filterEconomyActionsByOwner(catalog, { subclassSlug: "champion" }).map(
        (row) => row.id,
      ),
    ).toEqual(["champion-a"]);
  });

  it("filters feat and item owners", () => {
    expect(
      filterEconomyActionsByOwner(catalog, { featSlug: "lucky" }).map(
        (row) => row.id,
      ),
    ).toEqual(["lucky-a"]);
    expect(
      filterEconomyActionsByOwner(catalog, {
        itemSlug: "potion-of-healing",
      }).map((row) => row.id),
    ).toEqual(["potion-a"]);
  });

  it("filters species, thread and heritage trait owners", () => {
    expect(
      filterEconomyActionsByOwner(catalog, { speciesSlug: "dwarf" }).map(
        (row) => row.id,
      ),
    ).toEqual(["species-a"]);
    expect(
      filterEconomyActionsByOwner(catalog, { threadSlug: "cursemarked" }).map(
        (row) => row.id,
      ),
    ).toEqual(["thread-a"]);
    expect(
      filterEconomyActionsByOwner(catalog, {
        heritageTraitSlugs: ["potent-breath", "other"],
      }).map((row) => row.id),
    ).toEqual(["heritage-a"]);
  });
});

describe("sortEconomyActionsForCatalog", () => {
  it("orders by minLevel then name", () => {
    const sorted = sortEconomyActionsForCatalog([
      action({ id: "b", name: "Bravo", minLevel: 2 }),
      action({ id: "a", name: "Alfa", minLevel: 2 }),
      action({ id: "c", name: "Cedo", minLevel: 1 }),
    ]);
    expect(sorted.map((row) => row.id)).toEqual(["c", "a", "b"]);
  });
});
