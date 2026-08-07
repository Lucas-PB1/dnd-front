import { describe, expect, it } from "vitest";

import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import { resolvePanelActions } from "@/features/character/character-sheet/lib/combat/resolve-panel-actions";

const FIXTURE: ClassPanelActionRecord[] = [
  {
    panelKey: "monk|flurry-of-blows",
    classSlug: "monk",
    slug: "flurry-of-blows",
    name: "Torrente de Golpes",
    minLevel: 2,
    section: "base",
    spendsFocus: true,
    sortOrder: 2,
  },
  {
    panelKey: "monk|patient-defense",
    classSlug: "monk",
    slug: "patient-defense",
    name: "Defesa Paciente",
    minLevel: 2,
    section: "base",
    spendsFocus: true,
    sortOrder: 1,
  },
  {
    panelKey: "monk|open-hand|open-hand-technique",
    classSlug: "monk",
    subclassSlug: "open-hand",
    slug: "open-hand-technique",
    name: "Técnica da Mão Espalmada",
    minLevel: 3,
    section: "subclass",
    spendsFocus: false,
    sortOrder: 3,
  },
  {
    panelKey: "bard|grant-inspiration",
    classSlug: "bard",
    slug: "grant-inspiration",
    name: "Conceder Inspiração",
    minLevel: 1,
    resourceSlug: "bardicInspiration",
    section: "base",
    spendsFocus: false,
    sortOrder: 1,
  },
];

describe("resolvePanelActions", () => {
  it("filters by class, level and section and sorts by sortOrder", () => {
    const actions = resolvePanelActions(FIXTURE, {
      classSlug: "monk",
      level: 2,
      section: "base",
    });
    expect(actions.map((a) => a.slug)).toEqual([
      "patient-defense",
      "flurry-of-blows",
    ]);
  });

  it("includes subclass actions only for matching subclass", () => {
    const openHand = resolvePanelActions(FIXTURE, {
      classSlug: "monk",
      level: 5,
      subclassSlug: "open-hand",
      section: "subclass",
    });
    expect(openHand.some((a) => a.slug === "open-hand-technique")).toBe(true);

    const elements = resolvePanelActions(FIXTURE, {
      classSlug: "monk",
      level: 5,
      subclassSlug: "elements",
      section: "subclass",
    });
    expect(elements).toHaveLength(0);
  });
});
