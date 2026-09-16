export type CunningStrikeEffect = {
  slug: string;
  name: string;
  cost: number;
  unlockLevel: number;
  saveAbility?: string;
  subclassSlug?: string;
  note: string;
};

export type PersonaMask = {
  slug: string;
  name: string;
};

export type PrecautionSpell = {
  slug: string;
  name: string;
};

export type GunslingerManeuverCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  effectKind: string;
  riskCost: number;
  fromLevel: number;
  subclassSlug?: string;
};

export type BattleMasterManeuverCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  timing: string;
  addsToDamage: boolean;
  addsToAttack: boolean;
};

export type StrikeOption = {
  slug: string;
  name: string;
  subclassSlug?: string;
  resourceSlug?: string | null;
  tableAction?: string | null;
  costDice?: string | null;
  extraDice: string;
  extraDiceL18: string;
  damageType?: string | null;
  saveAbility?: string | null;
  onFailCondition?: string | null;
  onFailPendingKind?: string | null;
  onHitPendingKind?: string | null;
  replacesAttackWithSave: boolean;
  secondaryDice?: string | null;
  secondaryDiceL18?: string | null;
  ignoreTargetArmor: boolean;
  ignoreDamageResistance: boolean;
  addsArenaEffect: boolean;
  arenaEffectSlug?: string | null;
  noteOnly: boolean;
};

export type SubclassTableActionCatalogEntry = {
  subclassSlug: string;
  slug: string;
  name: string;
  unlockLevel: number;
  freeResourceSlug?: string;
  alwaysSpendsPool: boolean;
  rollsPoolDie: boolean;
  spendsOnlyOnSuccess: boolean;
  alwaysPoolCost?: number;
  repeatPoolCost?: number;
};

export type BeastborneAspectBenefit = {
  level: number;
  note: string;
};

export type ActionEconomyBucket =
  | "action"
  | "bonus"
  | "reaction"
  | "free";

export type ClassEconomyActionRecord = {
  id: string;
  name: string;
  economy: ActionEconomyBucket | string;
  classSlug?: string | null;
  minLevel: number;
  subclassSlug?: string;
  speciesSlug?: string | null;
  featSlug?: string | null;
  itemSlug?: string | null;
  heritageTraitSlug?: string | null;
  threadSlug?: string | null;
  minTraitTakes?: number;
  requiresOptionKey?: string;
  requiresOptionValue?: string;
  resourceSlug?: string;
  freeResourceSlug?: string;
  alwaysSpendsResource?: boolean;
  summary?: string;
  description?: string;
  tableAction?: string;
  spendAmount?: number;
  spellSlug?: string;
};

export type PanelActionSection =
  | "base"
  | "subclass"
  | "metamagic"
  | "channel";

export type ClassPanelActionRecord = {
  panelKey: string;
  classSlug: string;
  subclassSlug?: string;
  slug: string;
  name: string;
  title?: string;
  description?: string;
  minLevel: number;
  resourceSlug?: string;
  section: PanelActionSection | string;
  spendsFocus: boolean;
  sortOrder: number;
};

export type CombatMechanicalCatalog = {
  gunslingerManeuvers: GunslingerManeuverCatalogEntry[];
  battleMasterManeuvers: BattleMasterManeuverCatalogEntry[];
  cunningStrikeEffects: CunningStrikeEffect[];
  strikeOptions: StrikeOption[];
  tableActions: SubclassTableActionCatalogEntry[];
  personaMasks: PersonaMask[];
  beastborneAspectBenefits: BeastborneAspectBenefit[];
  dungeoneerSlayerLabels: string[];
  precautionSpells: PrecautionSpell[];
  economyActions: ClassEconomyActionRecord[];
  panelActions: ClassPanelActionRecord[];
};
