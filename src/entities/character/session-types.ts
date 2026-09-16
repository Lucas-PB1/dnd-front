import type { CoinPurse } from "@/entities/character/types";
import type { CompanionTracker } from "@/entities/companion/types";
export type { CoinPurse };
export type { CompanionTracker };

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
  grantedSpellUses?: Record<string, number>;
  grantedSpellCastOptions?: Array<{
    spellSlug: string;
    castEconomy: "at_will" | "once_per_long_rest" | "slot_only";
    freeCastsRemaining: number | null;
  }>;
  firearmChambers?: Record<string, number>;
  rageActive?: boolean;
  recklessActive?: boolean;
  personaMasks?: string[];
  bestialAspectLevel?: number;
  missileShieldArmed?: boolean;
  gigaMissileArmed?: boolean;
  starryFormActive?: boolean;
  stellarConstellation?: string | null;
  boardedActorId?: string | null;
  mesaCircumstances?: string[];
  aberrantMutationActive?: string | null;
  highElfCantripSwapAvailable?: boolean;
  wildShapeActive: boolean;
  wildShapeTemplateSlug: string | null;
  wildShapeKnownSlugs: string[];
  wildShapeFormSwapAvailable: boolean;
  wildShapeActorId: string | null;
  companions: CompanionTracker[];
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
  note?: string | null;
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
  addConditions?: string[];
  removeConditions?: string[];
  tempHp?: number;
  concentratingOn?: string | null;
  deathSaveSuccesses?: number;
  deathSaveFailures?: number;
  inspiration?: boolean;
  mesaCircumstances?: string[];
};

export type UseClassResourcePayload = {
  resourceSlug: string;
  amount?: number;
};

export type CastSpellPayload = {
  spellSlug: string;
  slotLevel?: number;
  useFreeCast?: boolean;
  freeCastResourceSlug?: string;
  itemCastResourceSlug?: string;
  itemCastSpendAmount?: number;
  itemCastItemSlug?: string;
  artifactRandomCast?: {
    itemSlug: string;
    bucket:
      | "minorBeneficial"
      | "majorBeneficial"
      | "minorDetrimental"
      | "majorDetrimental";
    index: number;
  };
  flexElevateExtraSlots?: number;
  flexReduce?: boolean;
};

export type CastSpellResult = {
  spellSlug: string;
  slotLevelUsed: number | null;
  note?: string | null;
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
  notes?: string[];
};

export type InventoryItem = {
  itemSlug: string;
  itemName: string;
  itemType: string;
  quantity: number;
  location: "equipped" | "backpack";
  equipmentSlot: string | null;
  attuned: boolean;
  isPactWeapon?: boolean;
  requiresAttunement: boolean;
  cursed?: boolean;
  curseBroken?: boolean;
  effectsActive: boolean;
  consumable?: boolean;
  effectsStatus: "active" | "inactive_unequipped" | "inactive_unattuned";
  weightKg: number;
  attachedCharmSlug?: string | null;
  attachedCharmName?: string | null;
  attachedCoverageSlug?: string | null;
  attachedCoverageName?: string | null;
  attachedCoverageBonus?: number | null;
  attachedCoverageAttuned?: boolean;
  attachedCoverageRequiresAttunement?: boolean;
  attachedCoverageSpellSlug?: string | null;
  boundSpellSlug?: string | null;
  isCoverage?: boolean;
  isMagic?: boolean;
  propertiesKind?: string | null;
  instanceProperties?: Record<string, unknown> | null;
  costText?: string | null;
  containedInItemSlug?: string | null;
};

export type InventoryEncumbrance = {
  totalWeightKg: number;
  carryingCapacityKg: number;
  encumbered: boolean;
};

export type CharacterInventory = {
  items: InventoryItem[];
  encumbrance: InventoryEncumbrance;
  wealth: CoinPurse;
  paymentContext: InventoryPaymentContext;
};

export type InventoryPaymentContext = {
  inCampaign: boolean;
  viewerIsDmOrAssistant: boolean;
  allowPlayerSkipPayment: boolean;
  chargeApplies: boolean;
};

export type AddInventoryItemPayload = {
  itemSlug: string;
  quantity?: number;
  pay?: boolean;
};

export type PatchCharacterWealthPayload = {
  coins: Partial<CoinPurse>;
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
  attachedCoverageAttuned?: boolean;
  boundSpellSlug?: string | null;
  pactWeapon?: boolean;
  containedInItemSlug?: string | null;
};

export type PurchaseInventoryLine = {
  itemSlug: string;
  quantity?: number;
  attachCoverageSlug?: string;
  attachCoverageBonus?: 1 | 2 | 3;
  attachToBaseSlug?: string;
};

export type PurchaseInventoryPayload = {
  lines: PurchaseInventoryLine[];
  pay?: boolean;
};

export type RemoveInventoryOptions = {
  quantity?: number;
  mode?: "sell" | "discard";
};

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

export type LevelUpSubclassOptionSlot = {
  optionKey: string;
  label: string;
  unlockLevel: number;
};

export type LevelUpFeatureUnlock = {
  name: string;
  description: string;
  level: number;
  source: "class" | "subclass";
  optionKey?: string | null;
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
  newFeatures?: LevelUpFeatureUnlock[];
  newSpellOptions: LevelUpSpellOption[];
  newAlwaysPreparedSpells?: LevelUpSpellOption[];
  newSubclassOptionSlots?: LevelUpSubclassOptionSlot[];
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

export type CharacterQuickNotes = {
  characterId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
