import { describe, expect, it } from "vitest";

import {
  groupClassEconomyActions,
  resolveClassEconomyActions,
} from "@/features/character/character-sheet/lib/combat/class-action-economy";

describe("resolveClassEconomyActions", () => {
  it("lists fighter second wind as bonus action from level 1", () => {
    const actions = resolveClassEconomyActions({
      classSlug: "fighter",
      level: 1,
    });
    const secondWind = actions.find((a) => a.id === "fighter-second-wind");
    expect(secondWind?.economy).toBe("bonus");
    expect(actions.some((a) => a.id === "fighter-action-surge")).toBe(false);
  });

  it("unlocks action surge and tactical mind at level 2", () => {
    const actions = resolveClassEconomyActions({
      classSlug: "fighter",
      level: 2,
    });
    expect(actions.some((a) => a.id === "fighter-action-surge")).toBe(true);
    expect(actions.some((a) => a.id === "fighter-tactical-mind")).toBe(true);
  });

  it("includes psi warrior reactions only for that subclass", () => {
    const base = resolveClassEconomyActions({
      classSlug: "fighter",
      level: 10,
      subclassSlug: "champion",
    });
    expect(base.some((a) => a.id === "fighter-psi-protective-field")).toBe(
      false,
    );

    const psi = resolveClassEconomyActions({
      classSlug: "fighter",
      level: 10,
      subclassSlug: "psi-warrior",
    });
    expect(psi.some((a) => a.id === "fighter-psi-protective-field")).toBe(true);
    expect(psi.some((a) => a.id === "fighter-psi-psychic-leap")).toBe(true);
  });

  it("groups by economy bucket", () => {
    const grouped = groupClassEconomyActions(
      resolveClassEconomyActions({
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
    const actions = resolveClassEconomyActions({
      classSlug: "rogue",
      level: 2,
    });
    expect(
      actions.find((a) => a.id === "rogue-cunning-action")?.economy,
    ).toBe("bonus");
  });
});
