/** Espelha CharacterStateResponseDto da dnd-api */
export type SpellSlotsMap = Record<string, number>;

export type ClassResourceState = {
  slug: string;
  name: string;
  max: number;
  used: number;
  remaining: number;
  dieFaces?: number | null;
  dieLabel?: string | null;
};

export type CharacterState = {
  spellSlotsMax: SpellSlotsMap;
  spellSlotsUsed: SpellSlotsMap;
  spellSlotsRemaining: SpellSlotsMap;
  classResources: ClassResourceState[];
  concentratingOn: string | null;
  conditions: string[];
  tempHp: number;
  hitPointsCurrent: number | null;
  hitPointsMax: number | null;
  hitDiceCurrent: number;
  hitDiceMax: number;
  hitDie: string | null;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  inspiration: boolean;
  firearmChambers?: Record<string, number>;
  rageActive?: boolean;
  recklessActive?: boolean;
  personaMasks?: string[];
  bestialAspectLevel?: number;
};

export type ResourceDieRoll = {
  resourceSlug: string;
  faces: number;
  value: number;
  expression: string;
};

export type UseClassResourceResult = {
  state: CharacterState;
  roll?: ResourceDieRoll | null;
};

export type GunslingerManeuver = {
  slug: string;
  name: string;
  description: string;
  effectKind: string;
  riskCost: number;
  fromLevel: number;
};

export type UseManeuverResult = {
  state: CharacterState;
  maneuverSlug: string;
  maneuverName: string;
  effectKind: string;
  riskRoll: ResourceDieRoll;
  tempHpGained?: number;
  missDamage?: number;
  acBonus?: number;
  checkBonus?: number;
  note: string;
};

export type PatchCharacterStatePayload = {
  conditions?: string[];
  tempHp?: number;
  concentratingOn?: string | null;
  deathSaveSuccesses?: number;
  deathSaveFailures?: number;
  inspiration?: boolean;
};

export type UseClassResourcePayload = {
  resourceSlug: string;
  amount?: number;
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
  hitDiceSpent?: number;
};

export type RestResult = {
  type: RestType;
  state: CharacterState;
  hitDiceSpent?: number;
  hitDiceRolls?: number[];
  hitPointsHealed?: number;
};

/** Espelha InventoryItemResponseDto */
export type InventoryItem = {
  itemSlug: string;
  itemName: string;
  itemType: string;
  quantity: number;
  location: "equipped" | "backpack";
  equipmentSlot: string | null;
  attuned: boolean;
  requiresAttunement: boolean;
  effectsActive: boolean;
  effectsStatus: "active" | "inactive_unequipped" | "inactive_unattuned";
  weightKg: number;
  attachedCharmSlug?: string | null;
  attachedCharmName?: string | null;
};

export type InventoryEncumbrance = {
  totalWeightKg: number;
  carryingCapacityKg: number;
  encumbered: boolean;
};

export type CharacterInventory = {
  items: InventoryItem[];
  encumbrance: InventoryEncumbrance;
};

export type AddInventoryItemPayload = {
  itemSlug: string;
  quantity?: number;
};

export type PatchInventoryItemPayload = {
  location?: "equipped" | "backpack";
  equipmentSlot?:
    | "armor"
    | "main_hand"
    | "off_hand"
    | "shield"
    | "worn"
    | "carried";
  quantity?: number;
  attuned?: boolean;
};

/** Espelha LevelUpPreviewDto */
export type LevelUpClassExpertiseSlot = {
  optionKey: string;
  unlockLevel: number;
};

export type LevelUpWeaponMasterySlot = {
  optionKey: string;
  unlockLevel: number;
};

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
  newClassExpertiseSlots: LevelUpClassExpertiseSlot[];
  newWeaponMasterySlots: LevelUpWeaponMasterySlot[];
};

export type LevelUpAsiDistributionMode = "plus2" | "plus1plus1";

export type LevelUpPayload = {
  subclassSlug?: string;
  classSkillSlugs?: string[];
  speciesChoices?: import("@/entities/character/sheet-types").SpeciesChoice[];
  subclassOptions?: import("@/entities/character/sheet-types").SubclassOption[];
  classOptions?: import("@/entities/character/sheet-types").ClassOption[];
  characterFeats?: import("@/entities/character/sheet-types").CharacterFeat[];
  featOptions?: import("@/entities/character/sheet-types").FeatOption[];
  characterSpells?: import("@/entities/character/sheet-types").CharacterSpell[];
  equipment?: import("@/entities/character/sheet-types").CharacterEquipment[];
  languageSlugs?: string[];
  abilityGenerationMethodSlug?: string;
  asiDistributionMode?: LevelUpAsiDistributionMode;
  asiPrimaryAbilitySlug?: string;
  asiSecondaryAbilitySlug?: string;
};
