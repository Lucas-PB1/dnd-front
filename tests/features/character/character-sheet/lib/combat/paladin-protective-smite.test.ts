import { describe, expect, it } from "vitest";

import type { ClassEconomyActionRecord } from "@/entities/combat-mechanical/types";
import {
  PALADIN_PROTECTIVE_SMITE_ECONOMY_ID,
  paladinProtectiveSmiteReminder,
} from "@/features/character/character-sheet/lib/combat/paladin-protective-smite";

const catalog: ClassEconomyActionRecord[] = [
  {
    id: PALADIN_PROTECTIVE_SMITE_ECONOMY_ID,
    name: "Destruição Protetora",
    economy: "free",
    classSlug: "paladin",
    subclassSlug: "devotion",
    minLevel: 15,
    summary: "Destruição Divina → Cobertura Parcial na aura",
    description:
      "Ao conjurar Destruição Divina, você e seus aliados têm Cobertura Parcial enquanto estiverem em sua Aura de Proteção.",
  },
];

describe("paladinProtectiveSmiteReminder", () => {
  it("returns the catalog row for devotion at the unlock level", () => {
    const reminder = paladinProtectiveSmiteReminder(catalog, {
      level: 15,
      subclassSlug: "devotion",
    });
    expect(reminder?.id).toBe(PALADIN_PROTECTIVE_SMITE_ECONOMY_ID);
    expect(reminder?.tableAction).toBeUndefined();
  });

  it("hides the reminder before unlock or on another oath", () => {
    expect(
      paladinProtectiveSmiteReminder(catalog, {
        level: 14,
        subclassSlug: "devotion",
      }),
    ).toBeNull();
    expect(
      paladinProtectiveSmiteReminder(catalog, {
        level: 20,
        subclassSlug: "vengeance",
      }),
    ).toBeNull();
  });
});
