/** Espelha CharacterStateResponseDto da dnd-api */
export type SpellSlotsMap = Record<string, number>;

export type CharacterState = {
  spellSlotsMax: SpellSlotsMap;
  spellSlotsUsed: SpellSlotsMap;
  spellSlotsRemaining: SpellSlotsMap;
  concentratingOn: string | null;
  conditions: string[];
  tempHp: number;
  hitPointsCurrent: number | null;
  hitPointsMax: number | null;
};

export type PatchCharacterStatePayload = {
  conditions?: string[];
  tempHp?: number;
  concentratingOn?: string | null;
};

export type CastSpellPayload = {
  spellSlug: string;
  slotLevel?: number;
};

export type CastSpellResult = {
  spellSlug: string;
  slotLevelUsed: number | null;
  state: CharacterState;
};

export type RestType = "short" | "long";

export type RestPayload = {
  type: RestType;
};

export type RestResult = {
  type: RestType;
  state: CharacterState;
};

/** Espelha InventoryItemResponseDto */
export type InventoryItem = {
  itemSlug: string;
  itemName: string;
  itemType: string;
  quantity: number;
  location: "equipped" | "backpack";
  equipmentSlot: string | null;
};

export type CharacterInventory = {
  items: InventoryItem[];
};

export type AddInventoryItemPayload = {
  itemSlug: string;
  quantity?: number;
};

export type PatchInventoryItemPayload = {
  location?: "equipped" | "backpack";
  equipmentSlot?: "armor" | "main_hand" | "off_hand" | "shield";
  quantity?: number;
};

/** Espelha LevelUpPreviewDto */
export type LevelUpSpellOption = {
  spellSlug: string;
  spellName: string;
  spellLevel: number;
};

export type LevelUpPreview = {
  currentLevel: number;
  nextLevel: number;
  currentProficiencyBonus: number;
  nextProficiencyBonus: number;
  estimatedHpGain: number;
  estimatedHitPointsMax: number;
  subclassRequired: boolean;
  subclassUnlockLevel?: number;
  isAsiOrFeatLevel: boolean;
  newSpellOptions: LevelUpSpellOption[];
};

export type LevelUpPayload = {
  subclassSlug?: string;
  classSkillSlugs?: string[];
  speciesChoices?: import("@/entities/character/sheet-types").SpeciesChoice[];
  subclassOptions?: import("@/entities/character/sheet-types").SubclassOption[];
  featSlugs?: string[];
  characterSpells?: import("@/entities/character/sheet-types").CharacterSpell[];
  equipment?: import("@/entities/character/sheet-types").CharacterEquipment[];
  languageSlugs?: string[];
  abilityGenerationMethodSlug?: string;
};
