import { describe, expect, it } from "vitest";

import { parseCombatMechanicalCatalog } from "@/entities/combat-mechanical/lib/combat-mechanical-catalog.schema";

const emptyCatalog = {
  gunslingerManeuvers: [],
  battleMasterManeuvers: [],
  cunningStrikeEffects: [],
  strikeOptions: [],
  tableActions: [],
  personaMasks: [],
  beastborneAspectBenefits: [],
  dungeoneerSlayerLabels: [],
  precautionSpells: [],
  panelActions: [],
};

describe("parseCombatMechanicalCatalog", () => {
  it("keeps owner slugs on economy actions", () => {
    const parsed = parseCombatMechanicalCatalog({
      ...emptyCatalog,
      economyActions: [
        {
          id: "heritage-potent-breath",
          name: "Sopro Potente",
          economy: "action",
          minLevel: 1,
          heritageTraitSlug: "potent-breath",
          summary: "Sopro",
        },
        {
          id: "dwarf-a",
          name: "Resiliência Anã",
          economy: "free",
          minLevel: 1,
          speciesSlug: "dwarf",
        },
        {
          id: "thread-a",
          name: "Marca",
          economy: "free",
          minLevel: 1,
          threadSlug: "cursemarked",
        },
      ],
    });
    expect(parsed.economyActions[0]?.heritageTraitSlug).toBe("potent-breath");
    expect(parsed.economyActions[1]?.speciesSlug).toBe("dwarf");
    expect(parsed.economyActions[2]?.threadSlug).toBe("cursemarked");
  });
});
