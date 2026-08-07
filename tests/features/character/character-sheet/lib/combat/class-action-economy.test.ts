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
});
