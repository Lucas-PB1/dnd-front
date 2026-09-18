import { describe, expect, it } from "vitest";

import { parseCharacterInventory } from "@/entities/character/lib/character-inventory.schema";
import { parseCharacterState } from "@/entities/character/lib/character-state.schema";
import { parseCombatMechanicalCatalog } from "@/entities/combat-mechanical/lib/combat-mechanical-catalog.schema";
import { ApiDtoError } from "@/shared/lib/parse-api-dto";

const validState = {
  spellSlotsMax: {},
  spellSlotsUsed: {},
  spellSlotsRemaining: {},
  classResources: [],
  concentratingOn: null,
  conditions: [],
  tempHp: 0,
  hitPointsCurrent: 8,
  hitPointsMax: 8,
  hitDiceCurrent: 1,
  hitDiceMax: 1,
  hitDie: "d8",
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  inspiration: false,
  wildShapeActive: false,
  wildShapeTemplateSlug: null,
  wildShapeKnownSlugs: [],
  wildShapeFormSwapAvailable: false,
  wildShapeActorId: null,
  companions: [],
};

const validInventory = {
  items: [
    {
      itemSlug: "dagger",
      itemName: "Adaga",
      itemType: "weapon",
      quantity: 1,
      location: "equipped",
      equipmentSlot: "main_hand",
      attuned: false,
      requiresAttunement: false,
      effectsActive: true,
      effectsStatus: "active",
      weightKg: 0.5,
    },
  ],
  encumbrance: {
    totalWeightKg: 0.5,
    carryingCapacityKg: 75,
    encumbered: false,
  },
  wealth: {
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 15,
    platinum: 0,
  },
  paymentContext: {
    inCampaign: false,
    viewerIsDmOrAssistant: false,
    allowPlayerSkipPayment: false,
    chargeApplies: false,
  },
  attunementLimit: 3,
};

const validCombatCatalog = {
  gunslingerManeuvers: [],
  battleMasterManeuvers: [],
  cunningStrikeEffects: [],
  strikeOptions: [],
  tableActions: [],
  personaMasks: [],
  beastborneAspectBenefits: [],
  dungeoneerSlayerLabels: [],
  precautionSpells: [],
  economyActions: [],
  panelActions: [],
};

describe("parseCharacterState", () => {
  it("accepts a valid payload and keeps unknown fields", () => {
    const parsed = parseCharacterState({ ...validState, extraFromApi: true });
    expect(parsed.tempHp).toBe(0);
    expect(parsed.wildShapeActive).toBe(false);
  });

  it("throws a visible contract error when required fields are missing", () => {
    expect(() => parseCharacterState({ tempHp: 0 })).toThrow(ApiDtoError);
    expect(() => parseCharacterState({ tempHp: 0 })).toThrow(
      /estado do personagem/,
    );
  });
});

describe("parseCharacterInventory", () => {
  it("accepts a valid inventory payload", () => {
    const parsed = parseCharacterInventory(validInventory);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.itemSlug).toBe("dagger");
  });

  it("accepts Treasure cast overlay fields on inventory items", () => {
    const parsed = parseCharacterInventory({
      ...validInventory,
      items: [
        {
          ...validInventory.items[0],
          itemSlug: "varinha-de-relampagos",
          itemName: "Varinha de Relâmpagos",
          spellSaveDc: 15,
          spellAttackBonus: null,
          requiresComponents: false,
          useCasterAbility: false,
        },
      ],
    });
    expect(parsed.items[0]?.spellSaveDc).toBe(15);
    expect(parsed.items[0]?.requiresComponents).toBe(false);
  });

  it("throws when items is missing", () => {
    const { items: _items, ...rest } = validInventory;
    expect(() => parseCharacterInventory(rest)).toThrow(ApiDtoError);
  });
});

describe("parseCombatMechanicalCatalog", () => {
  it("accepts a valid catalog payload", () => {
    const parsed = parseCombatMechanicalCatalog(validCombatCatalog);
    expect(parsed.strikeOptions).toEqual([]);
    expect(parsed.economyActions).toEqual([]);
  });

  it("throws when a catalog list is missing", () => {
    const { strikeOptions: _strikeOptions, ...rest } = validCombatCatalog;
    expect(() => parseCombatMechanicalCatalog(rest)).toThrow(ApiDtoError);
  });
});
