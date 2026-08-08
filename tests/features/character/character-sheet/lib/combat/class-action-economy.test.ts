import { describe, expect, it } from "vitest";

import type { ClassEconomyActionRecord } from "@/entities/combat-mechanical/types";
import {
  groupClassEconomyActions,
  resolveClassEconomyActions,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";

const FIXTURE_CATALOG: ClassEconomyActionRecord[] = [
  {
    id: "fighter-second-wind",
    name: "Recuperar Fôlego",
    economy: "bonus",
    classSlug: "fighter",
    minLevel: 1,
    resourceSlug: "secondWind",
    tableAction: "second-wind",
  },
  {
    id: "fighter-action-surge",
    name: "Surto de Ação",
    economy: "action",
    classSlug: "fighter",
    minLevel: 2,
    resourceSlug: "actionSurge",
    tableAction: "action-surge",
  },
  {
    id: "fighter-tactical-mind",
    name: "Mente Tática",
    economy: "free",
    classSlug: "fighter",
    minLevel: 2,
    resourceSlug: "secondWind",
    tableAction: "tactical-mind",
  },
  {
    id: "fighter-psi-protective-field",
    name: "Campo Protetor",
    economy: "reaction",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 3,
    resourceSlug: "psi-energy-dice",
    alwaysSpendsResource: true,
    tableAction: "psi:protective-field",
  },
  {
    id: "fighter-psi-psychic-leap",
    name: "Salto Psíquico",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 7,
    resourceSlug: "psi-energy-dice",
    tableAction: "psi:psychic-leap",
  },
  {
    id: "fighter-parry",
    name: "Aparar",
    economy: "reaction",
    classSlug: "fighter",
    subclassSlug: "battle-master",
    minLevel: 3,
  },
  {
    id: "rogue-cunning-action",
    name: "Ação Astuta",
    economy: "bonus",
    classSlug: "rogue",
    minLevel: 2,
  },
  {
    id: "species-dwarf-stonecunning",
    name: "Conhecimento de Pedras",
    economy: "bonus",
    speciesSlug: "dwarf",
    minLevel: 1,
    resourceSlug: "stonecunning",
    tableAction: "spend-resource",
  },
  {
    id: "species-goliath-cloud",
    name: "Salto da Nuvem",
    economy: "bonus",
    speciesSlug: "goliath",
    minLevel: 1,
    resourceSlug: "giantAncestry",
    requiresOptionKey: "giantAncestryId",
    requiresOptionValue: "cloud",
    tableAction: "spend-resource",
  },
  {
    id: "species-goliath-ice",
    name: "Arrepio do Gelo",
    economy: "free",
    speciesSlug: "goliath",
    minLevel: 1,
    resourceSlug: "giantAncestry",
    requiresOptionKey: "giantAncestryId",
    requiresOptionValue: "ice",
    tableAction: "spend-resource",
  },
  {
    id: "feat-lucky-advantage",
    name: "Sorte · Vantagem",
    economy: "free",
    featSlug: "lucky",
    minLevel: 1,
    resourceSlug: "luckPoints",
    tableAction: "spend-resource",
  },
  {
    id: "feat-polearm-master-haft",
    name: "Golpe de Haste",
    economy: "bonus",
    featSlug: "polearm-master",
    minLevel: 1,
  },
  {
    id: "item-ring-of-barrels",
    name: "Invocar Barris",
    economy: "action",
    itemSlug: "ring-of-barrels",
    minLevel: 1,
    resourceSlug: "ringBarrelCharges",
    tableAction: "spend-resource",
  },
];

describe("resolveClassEconomyActions", () => {
  it("lists fighter second wind as bonus action from level 1", () => {
    const actions = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "fighter",
      level: 1,
    });
    const secondWind = actions.find((a) => a.id === "fighter-second-wind");
    expect(secondWind?.economy).toBe("bonus");
    expect(actions.some((a) => a.id === "fighter-action-surge")).toBe(false);
  });

  it("unlocks action surge and tactical mind at level 2", () => {
    const actions = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "fighter",
      level: 2,
    });
    expect(actions.some((a) => a.id === "fighter-action-surge")).toBe(true);
    expect(actions.some((a) => a.id === "fighter-tactical-mind")).toBe(true);
  });

  it("includes psi warrior reactions only for that subclass", () => {
    const base = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "fighter",
      level: 10,
      subclassSlug: "champion",
    });
    expect(base.some((a) => a.id === "fighter-psi-protective-field")).toBe(
      false,
    );

    const psi = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "fighter",
      level: 10,
      subclassSlug: "psi-warrior",
    });
    expect(psi.some((a) => a.id === "fighter-psi-protective-field")).toBe(true);
    expect(psi.some((a) => a.id === "fighter-psi-psychic-leap")).toBe(true);
  });

  it("groups by economy bucket", () => {
    const grouped = groupClassEconomyActions(
      resolveClassEconomyActions(FIXTURE_CATALOG, {
        classSlug: "fighter",
        level: 10,
        subclassSlug: "battle-master",
      }),
    );
    expect(grouped.bonus.some((a) => a.name === "Recuperar Fôlego")).toBe(true);
    expect(grouped.reaction.some((a) => a.name === "Aparar")).toBe(true);
    expect(grouped.action.some((a) => a.name === "Surto de Ação")).toBe(true);
  });

  it("lists rogue cunning action as bonus", () => {
    const actions = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "rogue",
      level: 2,
    });
    expect(
      actions.find((a) => a.id === "rogue-cunning-action")?.economy,
    ).toBe("bonus");
  });

  it("includes dwarf stonecunning for dwarf species", () => {
    const actions = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "wizard",
      level: 20,
      speciesSlug: "dwarf",
    });
    expect(actions.some((a) => a.id === "species-dwarf-stonecunning")).toBe(
      true,
    );
  });

  it("filters goliath ancestry by species choice", () => {
    const actions = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "barbarian",
      level: 5,
      speciesSlug: "goliath",
      speciesChoices: [
        { choiceKind: "giant_ancestry", choiceSlug: "cloud" },
      ],
    });
    expect(actions.some((a) => a.id === "species-goliath-cloud")).toBe(true);
    expect(actions.some((a) => a.id === "species-goliath-ice")).toBe(false);
  });

  it("includes lucky economy only when feat is on the sheet", () => {
    const without = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "wizard",
      level: 5,
      featSlugs: [],
    });
    expect(without.some((a) => a.id === "feat-lucky-advantage")).toBe(false);

    const withLucky = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "wizard",
      level: 5,
      featSlugs: ["lucky"],
    });
    expect(withLucky.some((a) => a.id === "feat-lucky-advantage")).toBe(true);
    expect(withLucky.some((a) => a.id === "feat-polearm-master-haft")).toBe(
      false,
    );
  });

  it("includes item economy only when item is active", () => {
    const without = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "wizard",
      level: 5,
      activeItemSlugs: [],
    });
    expect(without.some((a) => a.id === "item-ring-of-barrels")).toBe(false);

    const withRing = resolveClassEconomyActions(FIXTURE_CATALOG, {
      classSlug: "wizard",
      level: 5,
      activeItemSlugs: ["ring-of-barrels"],
    });
    expect(withRing.some((a) => a.id === "item-ring-of-barrels")).toBe(true);
  });
});
